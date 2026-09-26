import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createAdjustment, getAdjustments, getAdjustmentById, updateAdjustment, deleteAdjustment,
  approveAdjustment, completeAdjustment
} from '../controllers/stockAdjustmentController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(requireRole('inventory_manager'), createAdjustment)
  .get(getAdjustments);

router.route('/:id')
  .get(getAdjustmentById)
  .put(requireRole('inventory_manager'), updateAdjustment)
  .delete(requireRole('inventory_manager'), deleteAdjustment);

router.post('/:id/approve', requireRole('inventory_manager'), approveAdjustment);
router.post('/:id/complete', requireRole('inventory_manager'), completeAdjustment);

export default router;
