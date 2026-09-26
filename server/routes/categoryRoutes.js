import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', requireRole('inventory_manager'), createCategory);
router.get('/', getCategories); // Staff and Manager can read
router.get('/:id', getCategoryById);
router.put('/:id', requireRole('inventory_manager'), updateCategory);
router.delete('/:id', requireRole('inventory_manager'), deleteCategory);

export default router;
