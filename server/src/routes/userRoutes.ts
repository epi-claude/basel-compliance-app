import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteCurrentUser,
  getAllUsers,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Current user routes
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);
router.post('/me/change-password', changePassword);
router.delete('/me', deleteCurrentUser);

// Admin routes
router.get('/', getAllUsers);

export default router;
