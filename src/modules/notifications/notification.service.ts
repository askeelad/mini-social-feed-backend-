import { notificationRepository } from './notification.repository';
import { sendPushNotification } from '../../utils/fcm.util';
import { userRepository } from '../users/user.repository';
import { NotificationType } from './notification.entity';
import { logger } from '../../utils/logger.util';

export const sendNotification = async (data: {
  recipientId: string;
  actorId: string;
  postId: string;
  type: NotificationType;
}): Promise<void> => {
  // Don't notify yourself
  if (data.recipientId === data.actorId) return;

  // Store in DB
  await notificationRepository.createNotification({
    recipient_id: data.recipientId,
    actor_id: data.actorId,
    post_id: data.postId,
    type: data.type,
  });

  // Send push notification if recipient has FCM token
  try {
    const recipient = await userRepository.findOne({ where: { id: data.recipientId } });
    if (recipient?.fcm_token) {
      const actor = await userRepository.findOne({ where: { id: data.actorId } });
      const actorName = actor?.username ?? 'Someone';
      const title =
        data.type === 'like'
          ? `${actorName} liked your post`
          : `${actorName} commented on your post`;
      await sendPushNotification({
        token: recipient.fcm_token,
        title,
        body: title,
        data: { type: data.type, postId: data.postId },
      });
    }
  } catch (error) {
    logger.error('Failed to send push notification:', error);
  }
};
