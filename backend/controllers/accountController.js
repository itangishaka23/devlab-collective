import bcrypt from 'bcryptjs';
import Event from '../models/Event.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// PUT /api/me/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, github } = req.body;
  const user = await User.updateProfile(req.user.id, { name, bio, github });
  res.json({ success: true, data: user });
});

// PUT /api/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const row = await User.findWithHash(req.user.id);
  if (!(await bcrypt.compare(req.body.currentPassword, row.password_hash))) {
    throw new AppError('Your current password is incorrect.', 400, [{ field: 'currentPassword', message: 'Incorrect password.' }]);
  }
  await User.updatePassword(req.user.id, await bcrypt.hash(req.body.newPassword, 12));
  res.json({ success: true, message: 'Password updated.' });
});

// GET /api/me/projects
export const myProjects = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Project.findForUser(req.user) });
});

// GET /api/me/events
export const myEvents = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Event.findForUser(req.user) });
});
