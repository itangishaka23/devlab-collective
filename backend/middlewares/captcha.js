import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Bot protection for public forms:
 *  1. Honeypot — a hidden "website" field humans never fill. Bots that do get a fake success.
 *  2. Cloudflare Turnstile — only enforced when TURNSTILE_SECRET is configured.
 */
export default asyncHandler(async (req, res, next) => {
  if (req.body && req.body.website) {
    return res.status(201).json({ success: true, message: 'Thanks!' });
  }
  if (!env.turnstileSecret) return next();

  const token = req.body?.captchaToken;
  if (!token) throw new AppError('Please complete the captcha.', 400);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.turnstileSecret, response: token, remoteip: req.ip }),
    signal: AbortSignal.timeout(8000),
  })
    .then((r) => r.json())
    .catch(() => null);

  if (!result?.success) throw new AppError('Captcha verification failed. Please try again.', 400);
  return next();
});
