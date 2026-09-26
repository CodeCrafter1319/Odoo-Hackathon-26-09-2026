import mongoose from 'mongoose';
import InternalTransfer from '../models/InternalTransfer.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Product from '../models/Product.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

class InternalTransferService {
  async validateDependencies(srcWarehouseId, srcLocationId, destWarehouseId, destLocationId, items) {
    if (!items || items.length === 0) {
      const error = new Error('Transfer must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    if (srcLocationId.toString() === destLocationId.toString()) {
      const error = new Error('Source and destination locations cannot be the same');
      error.statusCode = 400;
      throw error;
    }

    const srcWh = await Warehouse.findById(srcWarehouseId);
    if (!srcWh || !srcWh.isActive) {
      const error = new Error('Source warehouse is invalid or inactive');
      error.statusCode = 400;
      throw error;
    }

    const destWh = await Warehouse.findById(destWarehouseId);
    if (!destWh || !destWh.isActive) {
      const error = new Error('Destination warehouse is invalid or inactive');
      error.statusCode = 400;
      throw error;
    }

    const srcLoc = await Location.findById(srcLocationId);
    if (!srcLoc || srcLoc.warehouse.toString() !== srcWarehouseId.toString()) {
      const error = new Error('Source location does not belong to the source warehouse');
      error.statusCode = 400;
      throw error;
    }

    const destLoc = await Location.findById(destLocationId);
    if (!destLoc || destLoc.warehouse.toString() !== destWarehouseId.toString()) {
      const error = new Error('Destination location does not belong to the destination warehouse');
      error.statusCode = 400;
      throw error;
    }

    const productIds = items.map(item => {
      if (!item.quantity || item.quantity <= 0) {
        const error = new Error('Item quantity must be greater than 0');
        error.statusCode = 400;
        throw error;
      }
      return item.product;
    });

    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== productIds.length) {
      const error = new Error('One or more products are invalid or inactive');
      error.statusCode = 400;
      throw error;
    }
  }

  async createTransfer(data, user) {
    await this.validateDependencies(data.sourceWarehouse, data.sourceLocation, data.destinationWarehouse, data.destinationLocation, data.items);
    const transferNumber = `WH-TR-${Date.now()}`;
    const transfer = new InternalTransfer({ ...data, transferNumber, status: 'DRAFT', createdBy: user._id });
    return await transfer.save();
  }

  async getTransfers(query = {}) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;
    const transfers = await InternalTransfer.find(filters)
      .populate('sourceWarehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('destinationLocation', 'name code')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await InternalTransfer.countDocuments(filters);
    return { transfers, totalPages: Math.ceil(total / limit), currentPage: Number(page), total };
  }

  async getTransferById(id) {
    const transfer = await InternalTransfer.findById(id)
      .populate('sourceWarehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('destinationLocation', 'name code')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .populate('completedBy', 'name');
    if (!transfer) {
      const err = new Error('Transfer not found'); err.statusCode = 404; throw err;
    }
    return transfer;
  }

  async updateTransfer(id, data) {
    const transfer = await InternalTransfer.findById(id);
    if (!transfer) {
      const err = new Error('Transfer not found'); err.statusCode = 404; throw err;
    }
    if (transfer.status !== 'DRAFT') {
      const err = new Error('Only DRAFT transfers can be updated'); err.statusCode = 400; throw err;
    }
    
    if (data.sourceWarehouse || data.sourceLocation || data.destinationWarehouse || data.destinationLocation || data.items) {
      const sWh = data.sourceWarehouse || transfer.sourceWarehouse;
      const sLoc = data.sourceLocation || transfer.sourceLocation;
      const dWh = data.destinationWarehouse || transfer.destinationWarehouse;
      const dLoc = data.destinationLocation || transfer.destinationLocation;
      const items = data.items || transfer.items;
      await this.validateDependencies(sWh, sLoc, dWh, dLoc, items);
    }

    delete data.status; delete data.completedBy; delete data.completedAt;
    Object.assign(transfer, data);
    return await transfer.save();
  }

  async cancelTransfer(id) {
    const transfer = await InternalTransfer.findById(id);
    if (!transfer) {
      const err = new Error('Transfer not found'); err.statusCode = 404; throw err;
    }
    if (transfer.status === 'DONE' || transfer.status === 'CANCELED') {
      const err = new Error('Cannot cancel DONE or CANCELED transfers'); err.statusCode = 400; throw err;
    }
    transfer.status = 'CANCELED';
    return await transfer.save();
  }

  async transitionStatus(id, newStatus, currentExpectedStatuses) {
    const transfer = await InternalTransfer.findById(id);
    if (!transfer) {
      const err = new Error('Transfer not found'); err.statusCode = 404; throw err;
    }
    if (!currentExpectedStatuses.includes(transfer.status)) {
      const err = new Error(`Transfer must be in one of [${currentExpectedStatuses.join(', ')}] to transition to ${newStatus}`);
      err.statusCode = 400; throw err;
    }
    transfer.status = newStatus;
    return await transfer.save();
  }

  async scheduleTransfer(id) {
    return await this.transitionStatus(id, 'SCHEDULED', ['DRAFT']);
  }

  async startTransfer(id) {
    return await this.transitionStatus(id, 'IN_TRANSIT', ['SCHEDULED']);
  }

  async completeTransfer(id, user) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      return await this._executeComplete(id, user, session);
    } catch (error) {
      if (session) {
        await session.abortTransaction().catch(() => {});
        session.endSession();
      }
      if (error.message && error.message.includes('Transaction numbers')) {
        return await this._executeComplete(id, user, null);
      }
      throw error;
    }
  }

  async _executeComplete(id, user, session) {
    const opts = session ? { session } : {};
    const transfer = await InternalTransfer.findById(id, null, opts);
    
    if (!transfer) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
    if (transfer.status === 'DONE' || transfer.status === 'CANCELED') {
      const err = new Error('Transfer already done or canceled'); err.statusCode = 400; throw err;
    }
    if (transfer.status !== 'IN_TRANSIT') {
      const err = new Error('Transfer must be IN_TRANSIT to complete'); err.statusCode = 400; throw err;
    }

    await this.validateDependencies(transfer.sourceWarehouse, transfer.sourceLocation, transfer.destinationWarehouse, transfer.destinationLocation, transfer.items);

    for (const item of transfer.items) {
      // Deduct from Source
      const srcSb = await StockBalance.findOne({
        product: item.product, location: transfer.sourceLocation, warehouse: transfer.sourceWarehouse
      }, null, opts);

      if (!srcSb || srcSb.quantity < item.quantity) {
        const err = new Error('Insufficient stock at source location'); err.statusCode = 400; throw err;
      }

      const srcOldQty = srcSb.quantity;
      srcSb.quantity -= item.quantity;
      await srcSb.save(opts);

      const slOut = new StockLedger({
        transactionNumber: `TXN-TR-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: item.product, operationType: 'TRANSFER_OUT', referenceId: transfer._id,
        referenceNumber: transfer.transferNumber, warehouse: transfer.sourceWarehouse, sourceLocation: transfer.sourceLocation,
        quantity: item.quantity, previousQuantity: srcOldQty, newQuantity: srcSb.quantity, performedBy: user._id
      });
      await slOut.save(opts);

      // Add to Destination
      let destSb = await StockBalance.findOne({
        product: item.product, location: transfer.destinationLocation, warehouse: transfer.destinationWarehouse
      }, null, opts);

      let destOldQty = 0;
      if (destSb) {
        destOldQty = destSb.quantity;
        destSb.quantity += item.quantity;
      } else {
        destSb = new StockBalance({
          product: item.product, location: transfer.destinationLocation, warehouse: transfer.destinationWarehouse,
          quantity: item.quantity, reservedQuantity: 0
        });
      }
      await destSb.save(opts);

      const slIn = new StockLedger({
        transactionNumber: `TXN-TR-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: item.product, operationType: 'TRANSFER_IN', referenceId: transfer._id,
        referenceNumber: transfer.transferNumber, warehouse: transfer.destinationWarehouse, destinationLocation: transfer.destinationLocation,
        quantity: item.quantity, previousQuantity: destOldQty, newQuantity: destSb.quantity, performedBy: user._id
      });
      await slIn.save(opts);
    }

    transfer.status = 'DONE';
    transfer.completedBy = user._id;
    transfer.completedAt = new Date();
    await transfer.save(opts);

    if (session) { await session.commitTransaction(); session.endSession(); }
    return transfer;
  }
}
export default new InternalTransferService();
