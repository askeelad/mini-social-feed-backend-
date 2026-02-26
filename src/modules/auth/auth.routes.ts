import { Router, RequestHandler } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { signupSchema, loginSchema, refreshTokenSchema, fcmTokenSchema } from './auth.schema';
import { AuthenticatedRequest } from '../../types/request.types';

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/signup', validate(signupSchema), (req, res, next) => {
  void authController.signup(req, res, next);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(loginSchema), (req, res, next) => {
  void authController.login(req, res, next);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens generated
 */
router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => {
  void authController.refresh(req, res, next);
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', requireAuth as unknown as RequestHandler, (req, res, next) => {
  void authController.logout(req as AuthenticatedRequest, res, next);
});

/**
 * @swagger
 * /auth/fcm-token:
 *   put:
 *     tags: [Auth]
 *     summary: Update Firebase Cloud Messaging token
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token updated
 */
router.put(
  '/fcm-token',
  requireAuth as unknown as RequestHandler,
  validate(fcmTokenSchema),
  (req, res, next) => {
    void authController.updateFcmToken(req as AuthenticatedRequest, res, next);
  },
);

export default router;
