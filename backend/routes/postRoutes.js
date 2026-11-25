import { Router } from 'express';
import { addComment, getComments, getReactions, toggleReaction } from '../controllers/engagementController.js';
import { createPost, deletePost, getPost, getPosts, updatePost } from '../controllers/postController.js';
import { optionalAuth, protect, restrictTo } from '../middlewares/auth.js';
import { commentLimiter, formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { commentRules, idParam, listQueryRules, postRules, reactionRules } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', listQueryRules, validate, getPosts);
router.get('/:slug', getPost);

// Engagement
router.get('/:slug/comments', getComments);
router.post('/:slug/comments', commentLimiter, protect, commentRules, validate, addComment);
router.get('/:slug/reactions', optionalAuth, getReactions);
router.post('/:slug/reactions', formLimiter, optionalAuth, reactionRules, validate, toggleReaction);

// Admin writes
router.post('/', admin, postRules(true), validate, createPost);
router.put('/:id', admin, idParam, postRules(false), validate, updatePost);
router.delete('/:id', admin, idParam, validate, deletePost);

export default router;
