import { Router } from 'express';
import { createReport, deleteReport, downloadReport, getReports, updateReport } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { uploadPdf } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { idParam, reportRules } from '../middlewares/validators.js';

const router = Router();
const admin = [protect, restrictTo('admin')];

router.get('/', getReports);
router.get('/:id/download', idParam, validate, downloadReport);

// Auth first, then the file upload, then validation
router.post('/', admin, uploadPdf('reports', 'file'), reportRules(true), validate, createReport);
router.put('/:id', admin, uploadPdf('reports', 'file'), idParam, reportRules(false), validate, updateReport);
router.delete('/:id', admin, idParam, validate, deleteReport);

export default router;
