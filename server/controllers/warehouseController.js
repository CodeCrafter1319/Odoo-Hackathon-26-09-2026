import * as warehouseService from '../services/warehouseService.js';

export const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req, res, next) => {
  try {
    const result = await warehouseService.getWarehouses(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    res.status(200).json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
    res.status(200).json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.deleteWarehouse(req.params.id);
    res.status(200).json({ message: 'Warehouse deleted (soft)', warehouse });
  } catch (error) {
    next(error);
  }
};
