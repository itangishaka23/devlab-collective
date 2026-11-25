import { Router } from 'express';
import { createEvent, deleteEvent, getEvent, getEvents, registerForEvent, updateEvent } from '../controllers/eventController.js';
import { optionalAuth, protect, restrictTo } from '../middlewares/auth.js';
import captcha from '../middlewares/captcha.js';
import { formLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { eventRegisterRules, eventRules, idParam } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getEvents);
router.get('/:id', idParam, validate, getEvent);
router.post('/:id/register', formLimiter, optionalAuth, captcha, eventRegisterRules, validate, registerForEvent);

router.post('/', admin, eventRules(true), validate, createEvent);
router.put('/:id', admin, idParam, eventRules(false), validate, updateEvent);
router.delete('/:id', admin, idParam, validate, deleteEvent);

export default router;
