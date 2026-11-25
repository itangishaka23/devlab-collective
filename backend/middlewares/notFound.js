import AppError from '../utils/AppError.js';

export default (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
