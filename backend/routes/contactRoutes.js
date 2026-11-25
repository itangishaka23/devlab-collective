import { Router } from 'express';
import { sendMessage } from '../controllers/contactController.js';
import captcha from '../middlewares/captcha.js';
import { formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { contactRules } from '../middlewares/validators.js';

const router = Router();
router.post('/', formLimiter, captcha, contactRules, validate, sendMessage);
export default router;
