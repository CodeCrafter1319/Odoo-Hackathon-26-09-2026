import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLedgerEntries, getLedgerEntryById } from '../controllers/stockLedgerController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLedgerEntries);

router.route('/:id')
  .get(getLedgerEntryById);

export default router;
