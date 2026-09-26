import Location from '../models/Location.js';
import Warehouse from '../models/Warehouse.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockAdjustment from '../models/StockAdjustment.js';

export const createLocation = async (data) => {
  const { name, code, warehouse, parentLocation, type, isActive } = data;

  if (!name || !code || !warehouse || !type) {
    const err = new Error('Name, code, warehouse, and type are required');
    err.status = 400;
    throw err;
  }

  const normalizedCode = code.trim();
  const normalizedName = name.trim();

  const wh = await Warehouse.findById(warehouse);
  if (!wh) {
    const err = new Error('Warehouse not found');
    err.status = 404;
    throw err;
  }
  if (!wh.isActive) {
    const err = new Error('Warehouse is not active');
    err.status = 400;
    throw err;
  }

  if (parentLocation) {
    const parent = await Location.findById(parentLocation);
    if (!parent) {
      const err = new Error('Parent location not found');
      err.status = 404;
      throw err;
    }
    if (parent.warehouse.toString() !== warehouse.toString()) {
      const err = new Error('Parent location must belong to the same warehouse');
      err.status = 400;
      throw err;
    }
  }

  const existing = await Location.findOne({ warehouse, code: normalizedCode });
  if (existing) {
    const err = new Error('Location code already exists within this warehouse');
    err.status = 409;
    throw err;
  }

  const location = await Location.create({
    name: normalizedName,
    code: normalizedCode,
    warehouse,
    parentLocation,
    type,
    isActive
  });

  return location;
};

export const getLocations = async (query) => {
  const { page = 1, limit = 10, search, warehouse, isActive, sortBy = 'name', sortOrder = 'asc' } = query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  if (warehouse) {
    filter.warehouse = warehouse;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (query.isActive === 'all') {
    delete filter.isActive;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const total = await Location.countDocuments(filter);
  const data = await Location.find(filter)
    .populate('warehouse', 'name code')
    .populate('parentLocation', 'name code')
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

export const getLocationById = async (id) => {
  const location = await Location.findById(id)
    .populate('warehouse', 'name code')
    .populate('parentLocation', 'name code');
    
  if (!location) {
    const err = new Error('Location not found');
    err.status = 404;
    throw err;
  }
  return location;
};

export const updateLocation = async (id, data) => {
  const { name, code, warehouse, parentLocation, type, isActive } = data;

  const location = await Location.findById(id);
  if (!location) {
    const err = new Error('Location not found');
    err.status = 404;
    throw err;
  }

  let newWarehouseId = location.warehouse.toString();

  if (warehouse && warehouse !== newWarehouseId) {
    const wh = await Warehouse.findById(warehouse);
    if (!wh) {
      const err = new Error('New warehouse not found');
      err.status = 404;
      throw err;
    }
    if (!wh.isActive) {
      const err = new Error('New warehouse is not active');
      err.status = 400;
      throw err;
    }
    newWarehouseId = warehouse;
    location.warehouse = warehouse;
  }

  let newCode = location.code;
  if (code) {
    newCode = code.trim();
    location.code = newCode;
  }

  if (code || (warehouse && warehouse !== location.warehouse.toString())) {
    const existing = await Location.findOne({ 
      warehouse: newWarehouseId, 
      code: newCode, 
      _id: { $ne: id } 
    });
    if (existing) {
      const err = new Error('Location code already exists within this warehouse');
      err.status = 409;
      throw err;
    }
  }

  let newParentId = parentLocation !== undefined ? parentLocation : location.parentLocation;
  if (newParentId) {
    const parent = await Location.findById(newParentId);
    if (!parent) {
      const err = new Error('Parent location not found');
      err.status = 404;
      throw err;
    }
    if (parent.warehouse.toString() !== newWarehouseId) {
      const err = new Error('Parent location must belong to the same warehouse');
      err.status = 400;
      throw err;
    }
    location.parentLocation = newParentId;
  } else if (parentLocation === null) {
    location.parentLocation = null;
  }

  if (name) location.name = name.trim();
  if (type) location.type = type;
  if (isActive !== undefined) location.isActive = isActive;

  await location.save();
  return location;
};

export const deleteLocation = async (id) => {
  const location = await Location.findById(id);
  if (!location) {
    const err = new Error('Location not found');
    err.status = 404;
    throw err;
  }

  const [
    sbCount, slCount, rCount, doCount, itCount, saCount
  ] = await Promise.all([
    StockBalance.countDocuments({ location: id }),
    StockLedger.countDocuments({ $or: [{ sourceLocation: id }, { destinationLocation: id }] }),
    Receipt.countDocuments({ destinationLocation: id }),
    DeliveryOrder.countDocuments({ sourceLocation: id }),
    InternalTransfer.countDocuments({ $or: [{ sourceLocation: id }, { destinationLocation: id }] }),
    StockAdjustment.countDocuments({ location: id })
  ]);

  if (sbCount > 0 || slCount > 0 || rCount > 0 || doCount > 0 || itCount > 0 || saCount > 0) {
    const err = new Error('Cannot delete location referenced by other records.');
    err.status = 400;
    throw err;
  }

  location.isActive = false;
  await location.save();
  return location;
};
