import mongoose from 'mongoose';
import DeliveryOrder from '../models/DeliveryOrder.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Product from '../models/Product.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

class DeliveryOrderService {
  async validateDependencies(warehouseId, locationId, items) {
    if (!items || items.length === 0) {
      const error = new Error('Delivery Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      const error = new Error('Warehouse not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    const location = await Location.findById(locationId);
    if (!location || !location.isActive) {
      const error = new Error('Source location not found or inactive');
      error.statusCode = 404;
      throw error;
    }
    if (location.warehouse.toString() !== warehouseId.toString()) {
      const error = new Error('Source location does not belong to the specified warehouse');
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
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== productIds.length) {
      const error = new Error('One or more products not found or inactive');
      error.statusCode = 404;
      throw error;
    }
  }

  async createDeliveryOrder(data, user) {
    await this.validateDependencies(data.warehouse, data.sourceLocation, data.items);

    const deliveryNumber = `WH-OUT-${Date.now()}`;
    const deliveryOrder = new DeliveryOrder({
      ...data,
      deliveryNumber,
      status: 'DRAFT',
      createdBy: user._id,
    });

    return await deliveryOrder.save();
  }

  async getDeliveryOrders(query = {}) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const deliveryOrders = await DeliveryOrder.find(filters)
      .populate('warehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await DeliveryOrder.countDocuments(filters);

    return {
      deliveryOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  }

  async getDeliveryOrderById(id) {
    const deliveryOrder = await DeliveryOrder.findById(id)
      .populate('warehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('items.product', 'name sku price')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }

    return deliveryOrder;
  }

  async updateDeliveryOrder(id, data) {
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (deliveryOrder.status !== 'DRAFT') {
      const error = new Error('Can only update delivery orders in DRAFT status');
      error.statusCode = 400;
      throw error;
    }

    if (data.warehouse || data.sourceLocation || data.items) {
      const warehouseId = data.warehouse || deliveryOrder.warehouse;
      const locationId = data.sourceLocation || deliveryOrder.sourceLocation;
      const items = data.items || deliveryOrder.items;
      await this.validateDependencies(warehouseId, locationId, items);
    }

    delete data.status;
    delete data.validatedBy;
    delete data.validatedAt;

    Object.assign(deliveryOrder, data);
    return await deliveryOrder.save();
  }

  async cancelDeliveryOrder(id) {
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (deliveryOrder.status === 'DONE' || deliveryOrder.status === 'CANCELED') {
      const error = new Error('Cannot cancel delivery order that is already DONE or CANCELED');
      error.statusCode = 400;
      throw error;
    }

    deliveryOrder.status = 'CANCELED';
    return await deliveryOrder.save();
  }

  async pickDeliveryOrder(id) {
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Only allow transition from DRAFT or READY (if READY exists, DRAFT is default)
    if (deliveryOrder.status !== 'DRAFT' && deliveryOrder.status !== 'READY') {
      const error = new Error(`Cannot pick delivery order from status ${deliveryOrder.status}`);
      error.statusCode = 400;
      throw error;
    }

    deliveryOrder.status = 'PICKED';
    return await deliveryOrder.save();
  }

  async packDeliveryOrder(id) {
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (deliveryOrder.status !== 'PICKED') {
      const error = new Error('Delivery order must be PICKED before it can be PACKED');
      error.statusCode = 400;
      throw error;
    }

    deliveryOrder.status = 'PACKED';
    return await deliveryOrder.save();
  }

  async validateDeliveryOrder(id, user) {
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
      if (error.message && error.message.includes('Transaction numbers')) {
        console.warn('Transactions not supported. Retrying without transaction...');
        return await this._executeValidation(id, user, null);
      }
      throw error;
    }
  }

  async _executeValidation(id, user, session) {
    const opts = session ? { session } : {};
    
    const deliveryOrder = await DeliveryOrder.findById(id, null, opts);
    if (!deliveryOrder) {
      const error = new Error('Delivery Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (deliveryOrder.status === 'DONE' || deliveryOrder.status === 'CANCELED') {
      const error = new Error('Delivery order is already DONE or CANCELED');
      error.statusCode = 400;
      throw error;
    }
    
    if (deliveryOrder.status !== 'PACKED') {
      const error = new Error('Delivery order must be in PACKED status to be validated');
      error.statusCode = 400;
      throw error;
    }

    await this.validateDependencies(deliveryOrder.warehouse, deliveryOrder.sourceLocation, deliveryOrder.items);

    for (const item of deliveryOrder.items) {
      let stockBalance = await StockBalance.findOne({
        product: item.product,
        location: deliveryOrder.sourceLocation,
        warehouse: deliveryOrder.warehouse
      }, null, opts);

      if (!stockBalance || stockBalance.quantity < item.quantity) {
        const error = new Error(`Insufficient stock for product ${item.product}`);
        error.statusCode = 400;
        throw error;
      }

      const previousQuantity = stockBalance.quantity;
      stockBalance.quantity -= item.quantity;
      await stockBalance.save(opts);

      const stockLedger = new StockLedger({
        transactionNumber: `TXN-DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: item.product,
        operationType: 'DELIVERY',
        referenceId: deliveryOrder._id,
        referenceNumber: deliveryOrder.deliveryNumber,
        warehouse: deliveryOrder.warehouse,
        sourceLocation: deliveryOrder.sourceLocation,
        quantity: -item.quantity,
        previousQuantity,
        newQuantity: stockBalance.quantity,
        performedBy: user._id
      });
      await stockLedger.save(opts);
    }

    deliveryOrder.status = 'DONE';
    deliveryOrder.validatedBy = user._id;
    deliveryOrder.validatedAt = new Date();
    await deliveryOrder.save(opts);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return deliveryOrder;
  }
}

export default new DeliveryOrderService();
