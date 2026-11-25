import { Router } from 'express';
import { changePassword, myEvents, myProjects, updateProfile } from '../controllers/accountController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { passwordChangeRules, profileRules } from '../middlewares/validators.js';

const router = Router();
router.use(protect);
router.put('/profile', profileRules, validate, updateProfile);
router.put('/password', passwordChangeRules, validate, changePassword);
router.get('/projects', myProjects);
router.get('/events', myEvents);
export default router;
