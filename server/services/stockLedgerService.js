import StockLedger from '../models/StockLedger.js';

class StockLedgerService {
  async getLedgerEntries(query = {}) {
    const { 
      page = 1, 
      limit = 10, 
      product,
      warehouse,
      sourceLocation,
      destinationLocation,
      operationType,
      referenceNumber,
      startDate,
      endDate
    } = query;
    
    const skip = (page - 1) * limit;
    const filters = {};

    if (product) filters.product = product;
    if (warehouse) filters.warehouse = warehouse;
    if (sourceLocation) filters.sourceLocation = sourceLocation;
    if (destinationLocation) filters.destinationLocation = destinationLocation;
    if (operationType) filters.operationType = operationType;
    if (referenceNumber) filters.referenceNumber = { $regex: referenceNumber, $options: 'i' };
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const entries = await StockLedger.find(filters)
      .populate('product', 'name sku code')
      .populate('warehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('destinationLocation', 'name code')
      .populate('performedBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await StockLedger.countDocuments(filters);

    return {
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  }

  async getLedgerEntryById(id) {
    const entry = await StockLedger.findById(id)
      .populate('product', 'name sku code')
      .populate('warehouse', 'name code')
      .populate('sourceLocation', 'name code')
      .populate('destinationLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('referenceId');

    if (!entry) {
      const error = new Error('Ledger entry not found');
      error.statusCode = 404;
      throw error;
    }

    return entry;
  }
}

export default new StockLedgerService();
