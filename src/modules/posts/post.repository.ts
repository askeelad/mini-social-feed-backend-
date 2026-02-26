import { AppDataSource } from '../../config/database.config';
import { Post } from './post.entity';

export const postRepository = AppDataSource.getRepository(Post).extend({
  async findFeed(options: {
    page: number;
    limit: number;
    skip: number;
    username?: string;
  }): Promise<[Post[], number]> {
    const qb = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.content',
        'post.likes_count',
        'post.comments_count',
        'post.created_at',
        'post.updated_at',
        'author.id',
        'author.username',
        'author.email',
      ])
      .orderBy('post.created_at', 'DESC')
      .skip(options.skip)
      .take(options.limit);

    if (options.username) {
      qb.where('author.username = :username', { username: options.username });
    }

    return qb.getManyAndCount();
  },

  async searchPosts(options: {
    page: number;
    limit: number;
    skip: number;
    query: string;
  }): Promise<[Post[], number]> {
    const qb = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.content',
        'post.likes_count',
        'post.comments_count',
        'post.created_at',
        'post.updated_at',
        'author.id',
        'author.username',
        'author.email',
      ])
      .where('post.content ILIKE :query OR author.username ILIKE :query', {
        query: `%${options.query}%`,
      })
      .orderBy('post.created_at', 'DESC')
      .skip(options.skip)
      .take(options.limit);

    return qb.getManyAndCount();
  },

  async findById(id: string): Promise<Post | null> {
    return this.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.content',
        'post.likes_count',
        'post.comments_count',
        'post.created_at',
        'post.updated_at',
        'author.id',
        'author.username',
      ])
      .where('post.id = :id', { id })
      .getOne();
  },

  async createPost(data: { content: string; author_id: string }): Promise<Post> {
    const post = this.create(data);
    return this.save(post);
  },

  async updatePost(id: string, content: string): Promise<Post> {
    await this.update(id, { content });
    return this.findById(id) as Promise<Post>;
  },

  async incrementLikes(postId: string): Promise<void> {
    await this.increment({ id: postId }, 'likes_count', 1);
  },

  async decrementLikes(postId: string): Promise<void> {
    await this.decrement({ id: postId }, 'likes_count', 1);
  },

  async incrementComments(postId: string): Promise<void> {
    await this.increment({ id: postId }, 'comments_count', 1);
  },
});
