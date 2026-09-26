import express from 'express';
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  validateReceipt,
} from '../controllers/receiptController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(requireRole('inventory_manager'), createReceipt)
  .get(getReceipts);

router.route('/:id')
  .get(getReceiptById)
  .put(requireRole('inventory_manager'), updateReceipt)
  .delete(requireRole('inventory_manager'), deleteReceipt);

router.post('/:id/validate', requireRole('inventory_manager'), validateReceipt);

export default router;
