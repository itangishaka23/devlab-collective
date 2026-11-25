import { Router } from 'express';
import { createMember, deleteMember, getTeam, updateMember } from '../controllers/teamController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { idParam, teamRules } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getTeam);
router.post('/', admin, uploadImage('team', 'photo'), teamRules(true), validate, createMember);
router.put('/:id', admin, uploadImage('team', 'photo'), idParam, teamRules(false), validate, updateMember);
router.delete('/:id', admin, idParam, validate, deleteMember);

export default router;
