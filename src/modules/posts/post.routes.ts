import { Router, RequestHandler } from 'express';
import * as postController from './post.controller';
import * as likeController from '../likes/like.controller';
import * as commentController from '../comments/comment.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createPostSchema, getPostsQuerySchema, searchPostsQuerySchema } from './post.schema';
import { createCommentSchema } from '../comments/comment.schema';
import { AuthenticatedRequest } from '../../types/request.types';

const router = Router();

const auth = requireAuth as unknown as RequestHandler;

// Feed
/**
 * @swagger
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get paginated feed of posts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 */
router.get('/', auth, validate(getPostsQuerySchema), (req, res, next) => {
  void postController.getFeed(req as AuthenticatedRequest, res, next);
});

// Create post
/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/', auth, validate(createPostSchema), (req, res, next) => {
  void postController.createPost(req as AuthenticatedRequest, res, next);
});

// Search posts
/**
 * @swagger
 * /posts/search:
 *   get:
 *     tags: [Posts]
 *     summary: Search posts by content or username
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', auth, validate(searchPostsQuerySchema), (req, res, next) => {
  void postController.searchPosts(req as AuthenticatedRequest, res, next);
});

// Single post
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a post by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 */
router.get('/:id', auth, (req, res, next) => {
  void postController.getPostById(req as AuthenticatedRequest, res, next);
});

// Delete post
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/:id', auth, (req, res, next) => {
  void postController.deletePost(req as AuthenticatedRequest, res, next);
});

// Like / unlike
/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     tags: [Likes]
 *     summary: Toggle like on a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */
router.post('/:id/like', auth, (req, res, next) => {
  void likeController.toggleLike(req as AuthenticatedRequest, res, next);
});

// Add comment
/**
 * @swagger
 * /posts/{id}/comment:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/:id/comment', auth, validate(createCommentSchema), (req, res, next) => {
  void commentController.addComment(req as AuthenticatedRequest, res, next);
});

// Get comments
/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */
router.get('/:id/comments', auth, (req, res, next) => {
  void commentController.getComments(req as AuthenticatedRequest, res, next);
});

export default router;
