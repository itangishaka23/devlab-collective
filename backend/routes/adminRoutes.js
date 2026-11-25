import { Router } from 'express';
import {
  deleteMessage, deleteSubscriber, getMessages, getStats, getSubscribers, getUsers, updateMessageStatus,
} from '../controllers/adminController.js';
import { deleteApplication, getApplications, reviewApplication } from '../controllers/applicationController.js';
import { deleteComment, getAdminComments, setCommentStatus } from '../controllers/engagementController.js';
import { getRegistrations } from '../controllers/eventController.js';
import { getAdminPosts } from '../controllers/postController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { applicationStatusRules, commentStatusRules, idParam, messageStatusRules } from '../middlewares/validators.js';

const router = Router();
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);

router.get('/messages', getMessages);
router.patch('/messages/:id', messageStatusRules, validate, updateMessageStatus);
router.delete('/messages/:id', idParam, validate, deleteMessage);

router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', idParam, validate, deleteSubscriber);

router.get('/applications', getApplications);
router.patch('/applications/:id', applicationStatusRules, validate, reviewApplication);
router.delete('/applications/:id', idParam, validate, deleteApplication);

router.get('/comments', getAdminComments);
router.patch('/comments/:id', commentStatusRules, validate, setCommentStatus);
router.delete('/comments/:id', idParam, validate, deleteComment);

router.get('/posts', getAdminPosts);
router.get('/events/:id/registrations', idParam, validate, getRegistrations);

export default router;
