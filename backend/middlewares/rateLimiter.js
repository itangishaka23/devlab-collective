import rateLimit from 'express-rate-limit';

const make = (max, windowMinutes, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const apiLimiter = make(500, 15, 'Too many requests. Please slow down.');
// Public forms (contact, newsletter, project interest)
export const formLimiter = make(15, 15, 'Too many submissions. Please try again in a few minutes.');
export const loginLimiter = make(10, 15, 'Too many login attempts. Please try again later.');
export const registerLimiter = make(8, 60, 'Too many sign-ups from this address. Please try again later.');
export const commentLimiter = make(20, 15, 'You are commenting too quickly. Please wait a few minutes.');
