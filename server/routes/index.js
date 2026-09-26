import express from 'express';

const router = express.Router();

import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import warehouseRoutes from './warehouseRoutes.js';
import locationRoutes from './locationRoutes.js';
import receiptRoutes from './receiptRoutes.js';
import deliveryOrderRoutes from './deliveryOrderRoutes.js';
import internalTransferRoutes from './internalTransferRoutes.js';
import stockAdjustmentRoutes from './stockAdjustmentRoutes.js';

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StockSense backend is running' });
});

// Basic API version structure
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/locations', locationRoutes);
router.use('/receipts', receiptRoutes);
router.use('/delivery-orders', deliveryOrderRoutes);
router.use('/internal-transfers', internalTransferRoutes);
router.use('/stock-adjustments', stockAdjustmentRoutes);
router.use('/operations', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/ledger', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/dashboard', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));

export default router;
