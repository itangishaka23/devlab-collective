import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import { Emails } from '../services/emailTemplates.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const sign = (user) => jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, bio: u.bio || '', github: u.github || '' });

// ---- Brute-force protection: lock an email for 15 minutes after 5 failed logins ----
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map(); // email -> { count, until }

const checkLock = (email) => {
  const f = fails.get(email);
  if (f?.until && f.until > Date.now()) {
    const mins = Math.ceil((f.until - Date.now()) / 60000);
    throw new AppError(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`, 429);
  }
  if (f?.until && f.until <= Date.now()) fails.delete(email);
};
const recordFail = (email) => {
  const f = fails.get(email) || { count: 0 };
  f.count += 1;
  if (f.count >= MAX_FAILS) f.until = Date.now() + LOCK_MS;
  fails.set(email, f);
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findByEmail(email)) throw new AppError('An account with this email already exists. Try logging in.', 409);

  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'member' });
  Emails.welcome(user);
  res.status(201).json({ success: true, data: { token: sign(user), user: publicUser(user) } });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  checkLock(email);

  const user = await User.findByEmail(email);
  // Same message for unknown email and wrong password (no account enumeration)
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    recordFail(email);
    throw new AppError('Incorrect email or password.', 401);
  }
  fails.delete(email);
  res.json({ success: true, data: { token: sign(user), user: publicUser(user) } });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});
