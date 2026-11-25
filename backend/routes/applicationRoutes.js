import { Router } from 'express';
import { submitApplication } from '../controllers/applicationController.js';
import captcha from '../middlewares/captcha.js';
import { formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { applicationRules } from '../middlewares/validators.js';

const router = Router();
router.post('/', formLimiter, captcha, applicationRules, validate, submitApplication);
export default router;
