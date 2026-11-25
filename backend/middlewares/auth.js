import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Requires a valid "Authorization: Bearer <token>" header. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required.', 401);

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('The account for this token no longer exists.', 401);

  req.user = user;
  next();
});

/** Restricts a route to the given roles, e.g. restrictTo('admin'). */
export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do that.', 403));
  }
  return next();
};

/** Attaches req.user when a valid token is present, but never rejects the request. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), env.jwtSecret);
      req.user = (await User.findById(payload.id)) || undefined;
    } catch {
      /* ignore invalid token on optional routes */
    }
  }
  next();
});
