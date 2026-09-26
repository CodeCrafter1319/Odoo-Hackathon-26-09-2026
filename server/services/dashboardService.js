import mongoose from 'mongoose';
import StockBalance from '../models/StockBalance.js';
import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';

class DashboardService {
  async getSummary(query = {}) {
    const { warehouse, category } = query;

    let productFilter = { isActive: true };
    if (category) {
      productFilter.category = category;
    }

    const activeProducts = await Product.find(productFilter).select('_id reorderLevel');
    const activeProductIds = activeProducts.map(p => p._id);
    const productReorderLevels = new Map(activeProducts.map(p => [p._id.toString(), p.reorderLevel]));

    let stockFilter = { product: { $in: activeProductIds } };
    if (warehouse) {
      stockFilter.warehouse = warehouse;
    }

    // Aggregate stock by product
    const stockAgg = await StockBalance.aggregate([
      { $match: stockFilter },
      { $group: { _id: '$product', totalQuantity: { $sum: '$quantity' } } }
    ]);

    let totalProductsInStock = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    // Check all active products against their total stock
    const stockMap = new Map(stockAgg.map(s => [s._id.toString(), s.totalQuantity]));

    for (const [productId, reorderLevel] of productReorderLevels.entries()) {
      const qty = stockMap.get(productId) || 0;
      if (qty > 0) {
        totalProductsInStock++;
      }
      if (qty <= 0) {
        outOfStockProducts++;
      } else if (qty <= (reorderLevel || 0)) {
        lowStockProducts++;
      }
    }

    // Pending documents
    let receiptFilter = { status: { $in: ['DRAFT', 'WAITING', 'READY'] } };
    if (warehouse) receiptFilter.warehouse = warehouse;
    const pendingReceipts = await Receipt.countDocuments(receiptFilter);

    let deliveryFilter = { status: { $in: ['DRAFT', 'READY', 'PICKED', 'PACKED'] } };
    if (warehouse) deliveryFilter.warehouse = warehouse;
    const pendingDeliveries = await DeliveryOrder.countDocuments(deliveryFilter);

    let transferFilter = { status: { $in: ['DRAFT', 'SCHEDULED', 'IN_TRANSIT'] } };
    if (warehouse) transferFilter.$or = [{ sourceWarehouse: warehouse }, { destinationWarehouse: warehouse }];
    const scheduledTransfers = await InternalTransfer.countDocuments(transferFilter);

    return {
      totalProductsInStock,
      lowStockProducts,
      outOfStockProducts,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers
    };
  }
}

export default new DashboardService();
