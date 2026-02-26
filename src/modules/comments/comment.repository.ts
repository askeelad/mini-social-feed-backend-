import { AppDataSource } from '../../config/database.config';
import { Comment } from './comment.entity';

export const commentRepository = AppDataSource.getRepository(Comment).extend({
  async findByPost(
    postId: string,
    options: { skip: number; limit: number },
  ): Promise<[Comment[], number]> {
    return this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .select([
        'comment.id',
        'comment.content',
        'comment.created_at',
        'comment.updated_at',
        'author.id',
        'author.username',
      ])
      .where('comment.post_id = :postId', { postId })
      .orderBy('comment.created_at', 'ASC')
      .skip(options.skip)
      .take(options.limit)
      .getManyAndCount();
  },

  async createComment(data: {
    post_id: string;
    author_id: string;
    content: string;
  }): Promise<Comment> {
    const comment = this.create(data);
    return this.save(comment);
  },
});
