import { Router } from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All package routes require authentication
router.use(authMiddleware);

// Package routes
router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;
