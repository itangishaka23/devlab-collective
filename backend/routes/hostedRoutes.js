import { Router } from 'express';
import {
  createHostedProject, deleteHostedProject, getHostedProject, getHostedProjects, updateHostedProject,
} from '../controllers/hostedController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { hostedRules, idParam } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getHostedProjects);
router.get('/:ref', getHostedProject);

// Auth first, then the screenshot upload, then validation
router.post('/', admin, uploadImage('hosted', 'screenshot'), hostedRules(true), validate, createHostedProject);
router.put('/:id', admin, uploadImage('hosted', 'screenshot'), idParam, hostedRules(false), validate, updateHostedProject);
router.delete('/:id', admin, idParam, validate, deleteHostedProject);

export default router;
