import fs from 'node:fs';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/** Place after a validator chain: turns failures into a 422 with per-field messages. */
export default (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  // Don't leave an uploaded file behind when its form was rejected.
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  return next(new AppError('Please fix the highlighted fields.', 422, errors));
};
