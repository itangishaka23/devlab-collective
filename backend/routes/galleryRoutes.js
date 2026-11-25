import { Router } from 'express';
import { addImage, deleteImage, getGallery, updateImage } from '../controllers/galleryController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { galleryRules, idParam } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getGallery);
router.post('/', admin, uploadImage('gallery', 'image'), galleryRules(true), validate, addImage);
router.put('/:id', admin, idParam, galleryRules(false), validate, updateImage);
router.delete('/:id', admin, idParam, validate, deleteImage);

export default router;
