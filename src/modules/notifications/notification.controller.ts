import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/request.types';
import { notificationRepository } from './notification.repository';
import { sendSuccess } from '../../utils/response.util';
import { HTTP_STATUS } from '../../constants';

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const { notifications, total } = await notificationRepository.getUserNotifications(
      userId,
      page,
      limit,
    );

    sendSuccess(res, 'Notifications retrieved successfully', notifications, HTTP_STATUS.OK, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user.id;
    await notificationRepository.markAllAsRead(userId);
    sendSuccess(res, 'Notifications marked as read', null, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};
