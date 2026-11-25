import { Router } from 'express';
import { subscribe } from '../controllers/subscriberController.js';
import captcha from '../middlewares/captcha.js';
import { formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { subscribeRules } from '../middlewares/validators.js';

const router = Router();
router.post('/', formLimiter, captcha, subscribeRules, validate, subscribe);
export default router;
