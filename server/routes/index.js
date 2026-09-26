import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StockSense backend is running' });
});

// Basic API version structure (placeholders)
router.use('/auth', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/products', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/warehouses', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/operations', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/ledger', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));
router.use('/dashboard', (req, res) => res.status(501).json({ message: 'Not Implemented Yet' }));

export default router;
