import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createTransfer,
  getTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  scheduleTransfer,
  startTransfer,
  completeTransfer
} from '../controllers/internalTransferController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(requireRole('inventory_manager'), createTransfer)
  .get(getTransfers);

router.route('/:id')
  .get(getTransferById)
  .put(requireRole('inventory_manager'), updateTransfer)
  .delete(requireRole('inventory_manager'), deleteTransfer);

router.post('/:id/schedule', requireRole('inventory_manager'), scheduleTransfer);
router.post('/:id/start', requireRole('inventory_manager'), startTransfer);
router.post('/:id/complete', requireRole('inventory_manager'), completeTransfer);

export default router;
