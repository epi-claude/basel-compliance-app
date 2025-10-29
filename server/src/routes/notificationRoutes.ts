import { Router } from 'express';
import {
  getNotificationByPackageId,
  getNotificationById,
  updateNotification,
  autoSaveNotification,
  loadTestData,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// Notification routes
router.get('/package/:packageId', getNotificationByPackageId);
router.get('/:id', getNotificationById);
router.put('/:id', updateNotification);
router.patch('/:id/autosave', autoSaveNotification);
router.post('/:id/load-test-data', loadTestData);

export default router;
