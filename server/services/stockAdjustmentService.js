import mongoose from 'mongoose';
import StockAdjustment from '../models/StockAdjustment.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Product from '../models/Product.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

class StockAdjustmentService {
  async validateDependencies(warehouseId, locationId, items) {
    if (!items || items.length === 0) {
      const error = new Error('Adjustment must contain at least one item');
      error.statusCode = 400; throw error;
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      const error = new Error('Warehouse is invalid or inactive');
      error.statusCode = 400; throw error;
    }

    const location = await Location.findById(locationId);
    if (!location || location.warehouse.toString() !== warehouseId.toString()) {
      const error = new Error('Location does not belong to the specified warehouse');
      error.statusCode = 400; throw error;
    }

    const productIds = items.map(item => {
      if (item.countedQuantity === undefined || item.countedQuantity < 0) {
        const error = new Error('Item countedQuantity must be >= 0');
        error.statusCode = 400; throw error;
      }
      return item.product;
    });

    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== productIds.length) {
      const error = new Error('One or more products are invalid or inactive');
      error.statusCode = 400; throw error;
    }

    // Populate systemQuantity for new draft items
    for (const item of items) {
      if (item.systemQuantity === undefined) {
        const sb = await StockBalance.findOne({ product: item.product, warehouse: warehouseId, location: locationId });
        item.systemQuantity = sb ? sb.quantity : 0;
      }
    }
  }

  async createAdjustment(data, user) {
    await this.validateDependencies(data.warehouse, data.location, data.items);
    const adjustmentNumber = `WH-ADJ-${Date.now()}`;
    const adj = new StockAdjustment({ ...data, adjustmentNumber, status: 'DRAFT', createdBy: user._id });
    return await adj.save();
  }

  async getAdjustments(query = {}) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;
    const adjustments = await StockAdjustment.find(filters)
      .populate('warehouse', 'name code')
      .populate('location', 'name code')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await StockAdjustment.countDocuments(filters);
    return { adjustments, totalPages: Math.ceil(total / limit), currentPage: Number(page), total };
  }

  async getAdjustmentById(id) {
    const adj = await StockAdjustment.findById(id)
      .populate('warehouse', 'name code')
      .populate('location', 'name code')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');
    if (!adj) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    return adj;
  }

  async updateAdjustment(id, data) {
    const adj = await StockAdjustment.findById(id);
    if (!adj) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    if (adj.status !== 'DRAFT') { const err = new Error('Only DRAFT can be updated'); err.statusCode = 400; throw err; }
    
    if (data.warehouse || data.location || data.items) {
      const wId = data.warehouse || adj.warehouse;
      const lId = data.location || adj.location;
      const items = data.items || adj.items;
      await this.validateDependencies(wId, lId, items);
    }

    delete data.status; delete data.approvedBy; delete data.approvedAt;
    Object.assign(adj, data);
    return await adj.save();
  }

  async cancelAdjustment(id) {
    const adj = await StockAdjustment.findById(id);
    if (!adj) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    if (adj.status === 'DONE' || adj.status === 'CANCELED') {
      const err = new Error('Cannot cancel DONE or CANCELED adjustments'); err.statusCode = 400; throw err;
    }
    adj.status = 'CANCELED';
    return await adj.save();
  }

  async approveAdjustment(id, user) {
    const adj = await StockAdjustment.findById(id);
    if (!adj) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    if (adj.status !== 'DRAFT' && adj.status !== 'PENDING') {
      const err = new Error('Cannot approve from current status'); err.statusCode = 400; throw err;
    }
    adj.status = 'APPROVED';
    adj.approvedBy = user._id;
    adj.approvedAt = new Date();
    return await adj.save();
  }

  async completeAdjustment(id, user) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      return await this._executeComplete(id, user, session);
    } catch (error) {
      if (session) { await session.abortTransaction().catch(() => {}); session.endSession(); }
      if (error.message && error.message.includes('Transaction numbers')) {
        return await this._executeComplete(id, user, null);
      }
      throw error;
    }
  }

  async _executeComplete(id, user, session) {
    const opts = session ? { session } : {};
    const adj = await StockAdjustment.findById(id, null, opts);
    if (!adj) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    if (adj.status === 'DONE') { const err = new Error('Already done'); err.statusCode = 400; throw err; }
    if (adj.status !== 'APPROVED') { const err = new Error('Must be APPROVED to complete'); err.statusCode = 400; throw err; }

    for (const item of adj.items) {
      let sb = await StockBalance.findOne({
        product: item.product, location: adj.location, warehouse: adj.warehouse
      }, null, opts);

      let previousQuantity = 0;
      if (sb) {
        previousQuantity = sb.quantity;
      } else {
        sb = new StockBalance({
          product: item.product, location: adj.location, warehouse: adj.warehouse,
          quantity: 0, reservedQuantity: 0
        });
      }

      const diff = item.countedQuantity - previousQuantity;
      
      // Update item logic to reflect reality at moment of completion
      item.systemQuantity = previousQuantity;
      item.difference = diff;
      
      if (diff !== 0) {
        sb.quantity = item.countedQuantity;
        await sb.save(opts);

        const sl = new StockLedger({
          transactionNumber: `TXN-ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product: item.product, operationType: 'ADJUSTMENT', referenceId: adj._id,
          referenceNumber: adj.adjustmentNumber, warehouse: adj.warehouse, destinationLocation: adj.location,
          quantity: diff, previousQuantity, newQuantity: sb.quantity, performedBy: user._id
        });
        await sl.save(opts);
      }
    }

    adj.status = 'DONE';
    await adj.save(opts);
    if (session) { await session.commitTransaction(); session.endSession(); }
    return adj;
  }
}
export default new StockAdjustmentService();
