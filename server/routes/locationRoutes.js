import express from 'express';
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, requireRole('inventory_manager'), createLocation)
  .get(protect, getLocations);

router.route('/:id')
  .get(protect, getLocationById)
  .put(protect, requireRole('inventory_manager'), updateLocation)
  .delete(protect, requireRole('inventory_manager'), deleteLocation);

export default router;
