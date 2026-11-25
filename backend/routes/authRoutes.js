import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import captcha from '../middlewares/captcha.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { loginRules, registerRules } from '../middlewares/validators.js';

const router = Router();
router.post('/register', registerLimiter, captcha, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);
router.get('/me', protect, me);
export default router;
