import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const IMAGE_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const PDF_TYPES = { 'application/pdf': '.pdf' };

const makeUploader = (folder, types, maxBytes, field) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(env.uploadDir, folder);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString('hex')}${types[file.mimetype]}`),
    }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (req, file, cb) =>
      types[file.mimetype] ? cb(null, true) : cb(new AppError(`Unsupported file type. Allowed: ${Object.values(types).join(', ')}`, 400)),
  }).single(field);

// Check the real file signature, not just the (client supplied) MIME type.
const SIGNATURES = {
  image: (b) =>
    (b[0] === 0xff && b[1] === 0xd8) || // JPEG
    (b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG') || // PNG
    (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP'), // WebP
  pdf: (b) => b.slice(0, 5).toString() === '%PDF-',
};

const verifyMagic = (kind) => async (req, res, next) => {
  if (!req.file) return next();
  try {
    const handle = await fs.promises.open(req.file.path, 'r');
    const buf = Buffer.alloc(16);
    await handle.read(buf, 0, 16, 0);
    await handle.close();
    if (!SIGNATURES[kind](buf)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return next(new AppError('The uploaded file is not a valid file of that type.', 400));
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

/** Image upload (JPG/PNG/WebP, max 2 MB) saved in uploads/<folder>. File is exposed as req.file. */
export const uploadImage = (folder, field = 'image') => [makeUploader(folder, IMAGE_TYPES, 2 * 1024 * 1024, field), verifyMagic('image')];

/** PDF upload (max 10 MB). */
export const uploadPdf = (folder, field = 'file') => [makeUploader(folder, PDF_TYPES, 10 * 1024 * 1024, field), verifyMagic('pdf')];
