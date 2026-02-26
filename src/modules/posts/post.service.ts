import { postRepository } from './post.repository';
import { AppError } from '../../utils/app-error.util';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../constants';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { CreatePostInput } from './post.schema';
import { Post } from './post.entity';

export const createPost = async (authorId: string, data: CreatePostInput): Promise<Post> => {
  return postRepository.createPost({ content: data.content, author_id: authorId });
};

export const getFeed = async (
  rawPage?: string,
  rawLimit?: string,
  username?: string,
): Promise<{ posts: Post[]; meta: ReturnType<typeof buildPaginationMeta> }> => {
  const { page, limit, skip } = parsePagination(rawPage, rawLimit);
  const [posts, total] = await postRepository.findFeed({ page, limit, skip, username });
  const meta = buildPaginationMeta(total, page, limit);
  return { posts, meta };
};

export const searchPosts = async (
  query: string,
  rawPage?: string,
  rawLimit?: string,
): Promise<{ posts: Post[]; meta: ReturnType<typeof buildPaginationMeta> }> => {
  const { page, limit, skip } = parsePagination(rawPage, rawLimit);
  const [posts, total] = await postRepository.searchPosts({ page, limit, skip, query });
  const meta = buildPaginationMeta(total, page, limit);
  return { posts, meta };
};

export const getPostById = async (id: string): Promise<Post> => {
  const post = await postRepository.findById(id);
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return post;
};

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const post = await postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  if (post.author_id !== userId) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_OWNER, HTTP_STATUS.FORBIDDEN);
  }
  await postRepository.delete(postId);
};

export const updatePost = async (
  postId: string,
  userId: string,
  content: string,
): Promise<Post> => {
  const post = await postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  if (post.author_id !== userId) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_OWNER, HTTP_STATUS.FORBIDDEN);
  }

  return postRepository.updatePost(postId, content);
};
