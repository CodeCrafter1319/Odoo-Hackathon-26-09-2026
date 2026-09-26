import express from 'express';
import {
  createDeliveryOrder,
  getDeliveryOrders,
  getDeliveryOrderById,
  updateDeliveryOrder,
  cancelDeliveryOrder,
  pickDeliveryOrder,
  packDeliveryOrder,
  validateDeliveryOrder
} from '../controllers/deliveryOrderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDeliveryOrders)
  .post(requireRole('inventory_manager'), createDeliveryOrder);

router.route('/:id')
  .get(getDeliveryOrderById)
  .put(requireRole('inventory_manager'), updateDeliveryOrder)
  .delete(requireRole('inventory_manager'), cancelDeliveryOrder);

router.post('/:id/pick', requireRole('inventory_manager'), pickDeliveryOrder);
router.post('/:id/pack', requireRole('inventory_manager'), packDeliveryOrder);
router.post('/:id/validate', requireRole('inventory_manager'), validateDeliveryOrder);

export default router;
