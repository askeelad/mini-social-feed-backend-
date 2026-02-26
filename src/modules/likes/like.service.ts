import { likeRepository } from './like.repository';
import { postRepository } from '../posts/post.repository';
import { AppError } from '../../utils/app-error.util';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../constants';
import { sendNotification } from '../notifications/notification.service';
import { AppDataSource } from '../../config/database.config';
import { Like } from './like.entity';
import { Post } from '../posts/post.entity';

export const toggleLike = async (
  postId: string,
  userId: string,
): Promise<{ liked: boolean; message: string }> => {
  const post = await postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const existing = await likeRepository.findByPostAndUser(postId, userId);

  await AppDataSource.transaction(async (manager) => {
    if (existing) {
      await manager.delete(Like, { post_id: postId, user_id: userId });
      await manager.decrement(Post, { id: postId }, 'likes_count', 1);
    } else {
      const like = manager.create(Like, { post_id: postId, user_id: userId });
      await manager.save(like);
      await manager.increment(Post, { id: postId }, 'likes_count', 1);
    }
  });

  if (!existing) {
    void sendNotification({
      recipientId: post.author_id,
      actorId: userId,
      postId,
      type: 'like',
    });
  }

  return {
    liked: !existing,
    message: existing ? SUCCESS_MESSAGES.LIKE.UNLIKED : SUCCESS_MESSAGES.LIKE.LIKED,
  };
};
