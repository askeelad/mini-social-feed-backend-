import { Router, RequestHandler } from 'express';
import { getNotifications, markAsRead } from './notification.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth as unknown as RequestHandler);

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get current user notifications
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getNotifications as unknown as RequestHandler);

/**
 * @swagger
 * /notifications/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 */
router.put('/read', markAsRead as unknown as RequestHandler);

export default router;
