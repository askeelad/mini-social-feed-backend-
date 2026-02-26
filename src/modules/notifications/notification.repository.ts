import { AppDataSource } from '../../config/database.config';
import { Notification, NotificationType } from './notification.entity';

export const notificationRepository = AppDataSource.getRepository(Notification).extend({
  async createNotification(data: {
    recipient_id: string;
    actor_id: string;
    post_id: string;
    type: NotificationType;
  }): Promise<Notification> {
    const notification = this.create(data);
    return this.save(notification);
  },

  async getUserNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.findAndCount({
      where: { recipient_id: userId },
      relations: ['actor'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { notifications, total };
  },

  async markAllAsRead(userId: string): Promise<void> {
    await this.update({ recipient_id: userId, is_read: false }, { is_read: true });
  },
});
