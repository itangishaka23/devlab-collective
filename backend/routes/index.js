import { Router } from 'express';
import accountRoutes from './accountRoutes.js';
import adminRoutes from './adminRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import eventRoutes from './eventRoutes.js';
import faqRoutes from './faqRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import hostedRoutes from './hostedRoutes.js';
import postRoutes from './postRoutes.js';
import projectRoutes from './projectRoutes.js';
import reportRoutes from './reportRoutes.js';
import subscriberRoutes from './subscriberRoutes.js';
import teamRoutes from './teamRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'DevLab API is running.', time: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/me', accountRoutes);
router.use('/projects', projectRoutes);
router.use('/posts', postRoutes);
router.use('/faqs', faqRoutes);
router.use('/events', eventRoutes);
router.use('/applications', applicationRoutes);
router.use('/reports', reportRoutes);
router.use('/gallery', galleryRoutes);
router.use('/hosted-projects', hostedRoutes);
router.use('/team', teamRoutes);
router.use('/contact', contactRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/admin', adminRoutes);

export default router;
