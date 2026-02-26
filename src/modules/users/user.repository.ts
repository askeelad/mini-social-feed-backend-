import { AppDataSource } from '../../config/database.config';
import { User } from './user.entity';

export const userRepository = AppDataSource.getRepository(User).extend({
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  },

  async updateFcmToken(userId: string, targetToken: string): Promise<void> {
    await this.update(userId, { fcm_token: targetToken });
  },
});
