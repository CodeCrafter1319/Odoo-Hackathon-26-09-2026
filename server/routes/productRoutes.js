import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', requireRole('inventory_manager'), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', requireRole('inventory_manager'), updateProduct);
router.delete('/:id', requireRole('inventory_manager'), deleteProduct);

export default router;
