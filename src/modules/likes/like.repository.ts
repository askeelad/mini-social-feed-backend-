import { AppDataSource } from '../../config/database.config';
import { Like } from './like.entity';

export const likeRepository = AppDataSource.getRepository(Like).extend({
  async findByPostAndUser(postId: string, userId: string): Promise<Like | null> {
    return this.findOne({ where: { post_id: postId, user_id: userId } });
  },

  async createLike(postId: string, userId: string): Promise<Like> {
    const like = this.create({ post_id: postId, user_id: userId });
    return this.save(like);
  },

  async deleteLike(postId: string, userId: string): Promise<void> {
    await this.delete({ post_id: postId, user_id: userId });
  },
});
