import { commentRepository } from './comment.repository';
import { postRepository } from '../posts/post.repository';
import { AppError } from '../../utils/app-error.util';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../constants';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { sendNotification } from '../notifications/notification.service';
import { CreateCommentInput } from './comment.schema';
import { Comment } from './comment.entity';

export const addComment = async (
  postId: string,
  authorId: string,
  data: CreateCommentInput,
): Promise<Comment> => {
  const post = await postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const comment = await commentRepository.createComment({
    post_id: postId,
    author_id: authorId,
    content: data.content,
  });

  await postRepository.incrementComments(postId);

  void sendNotification({
    recipientId: post.author_id,
    actorId: authorId,
    postId,
    type: 'comment',
  });

  return comment;
};

export const getComments = async (
  postId: string,
  rawPage?: string,
  rawLimit?: string,
): Promise<{ comments: Comment[]; meta: ReturnType<typeof buildPaginationMeta> }> => {
  const post = await postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new AppError(ERROR_MESSAGES.POST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const { page, limit, skip } = parsePagination(rawPage, rawLimit);
  const [comments, total] = await commentRepository.findByPost(postId, { skip, limit });
  const meta = buildPaginationMeta(total, page, limit);
  return { comments, meta };
};
