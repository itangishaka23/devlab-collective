import { Router } from 'express';
import {
  addInterest, createProject, deleteProject, getProject, getProjectGithub, getProjects, updateProject,
} from '../controllers/projectController.js';
import { optionalAuth, protect, restrictTo } from '../middlewares/auth.js';
import captcha from '../middlewares/captcha.js';
import { formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { idParam, interestRules, projectRules } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getProjects);
router.get('/:ref', getProject);
router.get('/:ref/github', getProjectGithub);
router.post('/:id/interest', formLimiter, optionalAuth, captcha, interestRules, validate, addInterest);

router.post('/', admin, projectRules(true), validate, createProject);
router.put('/:id', admin, idParam, projectRules(false), validate, updateProject);
router.delete('/:id', admin, idParam, validate, deleteProject);

export default router;
