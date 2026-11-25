import { Router } from 'express';
import { createFaq, deleteFaq, getFaqs, updateFaq } from '../controllers/faqController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { faqRules, idParam, listQueryRules } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', listQueryRules, validate, getFaqs);
router.post('/', admin, faqRules(true), validate, createFaq);
router.put('/:id', admin, idParam, faqRules(false), validate, updateFaq);
router.delete('/:id', admin, idParam, validate, deleteFaq);

export default router;
