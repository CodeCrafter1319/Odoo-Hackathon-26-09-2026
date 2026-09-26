import express from 'express';
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, requireRole('inventory_manager'), createWarehouse)
  .get(protect, getWarehouses);

router.route('/:id')
  .get(protect, getWarehouseById)
  .put(protect, requireRole('inventory_manager'), updateWarehouse)
  .delete(protect, requireRole('inventory_manager'), deleteWarehouse);

export default router;
