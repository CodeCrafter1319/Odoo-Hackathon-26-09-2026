import mongoose from 'mongoose';
import Receipt from '../models/Receipt.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Product from '../models/Product.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

class ReceiptService {
  async validateDependencies(warehouseId, locationId, items) {
    if (!items || items.length === 0) {
      const error = new Error('Receipt must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      const error = new Error('Warehouse not found');
      error.statusCode = 404;
      throw error;
    }

    const location = await Location.findById(locationId);
    if (!location) {
      const error = new Error('Destination location not found');
      error.statusCode = 404;
      throw error;
    }
    if (location.warehouse.toString() !== warehouseId.toString()) {
      const error = new Error('Destination location does not belong to the specified warehouse');
      error.statusCode = 400;
      throw error;
    }

    const productIds = items.map((item) => {
      if (!item.quantity || item.quantity <= 0) {
        const error = new Error('Item quantity must be greater than 0');
        error.statusCode = 400;
        throw error;
      }
      return item.product;
    });
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      const error = new Error('One or more products not found');
      error.statusCode = 404;
      throw error;
    }
  }

  async createReceipt(data, user) {
    await this.validateDependencies(data.warehouse, data.destinationLocation, data.items);

    const receiptNumber = `WH-IN-${Date.now()}`;
    const receipt = new Receipt({
      ...data,
      receiptNumber,
      status: 'DRAFT',
      createdBy: user._id,
    });

    return await receipt.save();
  }

  async getReceipts(query = {}) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const receipts = await Receipt.find(filters)
      .populate('warehouse', 'name code')
      .populate('destinationLocation', 'name code')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Receipt.countDocuments(filters);

    return {
      receipts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  }

  async getReceiptById(id) {
    const receipt = await Receipt.findById(id)
      .populate('warehouse', 'name code')
      .populate('destinationLocation', 'name code')
      .populate('items.product', 'name sku price')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    return receipt;
  }

  async updateReceipt(id, data) {
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'DONE' || receipt.status === 'CANCELED') {
      const error = new Error('Cannot update receipt that is already DONE or CANCELED');
      error.statusCode = 400;
      throw error;
    }

    if (data.warehouse || data.destinationLocation || data.items) {
      const warehouseId = data.warehouse || receipt.warehouse;
      const locationId = data.destinationLocation || receipt.destinationLocation;
      const items = data.items || receipt.items;
      await this.validateDependencies(warehouseId, locationId, items);
    }

    // Do not allow updating status directly here (preventing manual bypass)
    delete data.status;
    delete data.validatedBy;
    delete data.validatedAt;

    Object.assign(receipt, data);
    return await receipt.save();
  }

  async deleteReceipt(id) {
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'DONE') {
      const error = new Error('Cannot cancel receipt that is already DONE');
      error.statusCode = 400;
      throw error;
    }

    receipt.status = 'CANCELED';
    return await receipt.save();
  }

  async validateReceipt(id, user) {
    let useSession = true;
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      return await this._executeValidation(id, user, session);
    } catch (error) {
      if (session) {
        await session.abortTransaction().catch(() => {});
        session.endSession();
      }
      // If error is about transactions not supported on standalone server, retry without session
      if (error.message && error.message.includes('Transaction numbers')) {
        console.warn('Transactions not supported (standalone MongoDB). Retrying without transaction...');
        return await this._executeValidation(id, user, null);
      }
      throw error;
    }
  }

  async _executeValidation(id, user, session) {
    const opts = session ? { session } : {};
    
    const receipt = await Receipt.findById(id, null, opts);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'DONE') {
      const error = new Error('Receipt is already validated (DONE)');
      error.statusCode = 400;
      throw error;
    }

    await this.validateDependencies(receipt.warehouse, receipt.destinationLocation, receipt.items);

    for (const item of receipt.items) {
      // Find or create StockBalance
      let stockBalance = await StockBalance.findOne({
        product: item.product,
        location: receipt.destinationLocation,
        warehouse: receipt.warehouse
      }, null, opts);

      let previousQuantity = 0;
      if (stockBalance) {
        previousQuantity = stockBalance.quantity;
        stockBalance.quantity += item.quantity;
      } else {
        stockBalance = new StockBalance({
          product: item.product,
          location: receipt.destinationLocation,
          warehouse: receipt.warehouse,
          quantity: item.quantity,
          reservedQuantity: 0
        });
      }
      
      await stockBalance.save(opts);

      // Create StockLedger entry
      const stockLedger = new StockLedger({
        transactionNumber: `TXN-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: item.product,
        operationType: 'RECEIPT',
        referenceId: receipt._id,
        referenceNumber: receipt.receiptNumber,
        warehouse: receipt.warehouse,
        destinationLocation: receipt.destinationLocation,
        quantity: item.quantity,
        previousQuantity,
        newQuantity: stockBalance.quantity,
        performedBy: user._id
      });
      await stockLedger.save(opts);
    }

    receipt.status = 'DONE';
    receipt.validatedBy = user._id;
    receipt.validatedAt = new Date();
    await receipt.save(opts);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return receipt;
  }
}

export default new ReceiptService();
