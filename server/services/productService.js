import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

export const createProduct = async (data, userId) => {
  const { name, sku, category, uom, reorderLevel, isActive, initialStock, warehouse, location } = data;

  if (!name || !sku || !category || !uom) {
    const err = new Error('Name, SKU, category, and UoM are required');
    err.status = 400;
    throw err;
  }

  if (reorderLevel !== undefined && reorderLevel < 0) {
    const err = new Error('Reorder level cannot be negative');
    err.status = 400;
    throw err;
  }

  if (initialStock !== undefined && initialStock < 0) {
    const err = new Error('Initial stock cannot be negative');
    err.status = 400;
    throw err;
  }

  if (initialStock > 0) {
    if (!warehouse || !location) {
      const err = new Error('Warehouse and location are required when initial stock is provided');
      err.status = 400;
      throw err;
    }
    const wh = await Warehouse.findById(warehouse);
    if (!wh || !wh.isActive) {
      const err = new Error('Invalid or inactive warehouse');
      err.status = 400;
      throw err;
    }
    const loc = await Location.findById(location);
    if (!loc || !loc.isActive) {
      const err = new Error('Invalid or inactive location');
      err.status = 400;
      throw err;
    }
    if (loc.warehouse.toString() !== warehouse.toString()) {
      const err = new Error('Location does not belong to the selected warehouse');
      err.status = 400;
      throw err;
    }
  }

  const normalizedSku = sku.trim().toUpperCase();

  const existingSku = await Product.findOne({ sku: normalizedSku });
  if (existingSku) {
    const err = new Error('SKU already exists');
    err.status = 409;
    throw err;
  }

  const cat = await Category.findById(category);
  if (!cat || !cat.isActive) {
    const err = new Error(cat ? 'Cannot assign to an inactive category' : 'Invalid category ID');
    err.status = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = new Product({
      name: name.trim(),
      sku: normalizedSku,
      category,
      uom: uom.trim(),
      reorderLevel: reorderLevel || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    await product.save({ session });

    if (initialStock > 0) {
      const sb = new StockBalance({
        product: product._id,
        warehouse,
        location,
        quantity: initialStock,
        reservedQuantity: 0,
      });
      await sb.save({ session });

      const sl = new StockLedger({
        transactionNumber: `TXN-INIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: product._id,
        operationType: 'INITIAL_STOCK',
        warehouse,
        destinationLocation: location,
        quantity: initialStock,
        previousQuantity: 0,
        newQuantity: initialStock,
        performedBy: userId,
      });
      await sl.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return product;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getProducts = async (query) => {
  const { page = 1, limit = 10, search, category, isActive, sortBy = 'name', sortOrder = 'asc' } = query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    filter.category = category;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else if (query.isActive !== 'all') {
    // Optionally return active by default if not specified
    // filter.isActive = true; // Not strictly demanded but common
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const total = await Product.countDocuments(filter);
  const data = await Product.find(filter)
    .populate('category', 'name isActive')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const productIds = data.map(p => p._id);
  const stockBalances = await StockBalance.aggregate([
    { $match: { product: { $in: productIds } } },
    { $group: { _id: '$product', totalQuantity: { $sum: '$quantity' } } }
  ]);

  const stockMap = new Map(stockBalances.map(sb => [sb._id.toString(), sb.totalQuantity]));

  const productsWithStock = data.map(product => {
    const quantity = stockMap.get(product._id.toString()) || 0;
    let stockStatus = 'In Stock';
    if (quantity <= 0) stockStatus = 'Out of Stock';
    else if (quantity <= (product.reorderLevel || 0)) stockStatus = 'Low Stock';

    return {
      ...product,
      stockQuantity: quantity,
      stockStatus
    };
  });

  return {
    data: productsWithStock,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate('category', 'name isActive');
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
};

export const updateProduct = async (id, data) => {
  const { name, sku, category, uom, reorderLevel, isActive } = data;

  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (sku) {
    const normalizedSku = sku.trim().toUpperCase();
    if (normalizedSku !== product.sku) {
      const existingSku = await Product.findOne({ sku: normalizedSku });
      if (existingSku) {
        const err = new Error('SKU already exists');
        err.status = 409;
        throw err;
      }
      product.sku = normalizedSku;
    }
  }

  if (category && category !== product.category.toString()) {
    const cat = await Category.findById(category);
    if (!cat) {
      const err = new Error('Invalid category ID');
      err.status = 400;
      throw err;
    }
    product.category = category;
  }

  if (reorderLevel !== undefined) {
    if (reorderLevel < 0) {
      const err = new Error('Reorder level cannot be negative');
      err.status = 400;
      throw err;
    }
    product.reorderLevel = reorderLevel;
  }

  if (name) product.name = name.trim();
  if (uom) product.uom = uom.trim();
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  // Soft delete
  product.isActive = false;
  await product.save();
  return product;
};
