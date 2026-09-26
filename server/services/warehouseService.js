import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import StockBalance from '../models/StockBalance.js';

export const createWarehouse = async (data) => {
  const { name, code, address, isActive } = data;
  
  if (!name || !code) {
    const err = new Error('Name and code are required');
    err.status = 400;
    throw err;
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedName = name.trim();

  const existing = await Warehouse.findOne({ code: normalizedCode });
  if (existing) {
    const err = new Error('Warehouse code already exists');
    err.status = 409;
    throw err;
  }

  const warehouse = await Warehouse.create({
    name: normalizedName,
    code: normalizedCode,
    address: address ? address.trim() : address,
    isActive
  });

  return warehouse;
};

export const getWarehouses = async (query) => {
  const { page = 1, limit = 10, search, isActive, sortBy = 'name', sortOrder = 'asc' } = query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (query.isActive === 'all') {
    delete filter.isActive;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const total = await Warehouse.countDocuments(filter);
  const data = await Warehouse.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    }
  };
};

export const getWarehouseById = async (id) => {
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    const err = new Error('Warehouse not found');
    err.status = 404;
    throw err;
  }
  return warehouse;
};

export const updateWarehouse = async (id, data) => {
  const { name, code, address, isActive } = data;

  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    const err = new Error('Warehouse not found');
    err.status = 404;
    throw err;
  }

  if (code) {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode !== warehouse.code) {
      const existing = await Warehouse.findOne({ code: normalizedCode });
      if (existing) {
        const err = new Error('Warehouse code already exists');
        err.status = 409;
        throw err;
      }
      warehouse.code = normalizedCode;
    }
  }

  if (name) warehouse.name = name.trim();
  if (address !== undefined) warehouse.address = address ? address.trim() : address;
  if (isActive !== undefined) warehouse.isActive = isActive;

  await warehouse.save();
  return warehouse;
};

export const deleteWarehouse = async (id) => {
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    const err = new Error('Warehouse not found');
    err.status = 404;
    throw err;
  }

  const locationCount = await Location.countDocuments({ warehouse: id });
  if (locationCount > 0) {
    const err = new Error('Cannot delete warehouse referenced by locations.');
    err.status = 400;
    throw err;
  }

  const stockBalanceCount = await StockBalance.countDocuments({ warehouse: id });
  if (stockBalanceCount > 0) {
    const err = new Error('Cannot delete warehouse referenced by stock balances.');
    err.status = 400;
    throw err;
  }

  warehouse.isActive = false;
  await warehouse.save();
  return warehouse;
};
