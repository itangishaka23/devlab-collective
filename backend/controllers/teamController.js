import TeamMember from '../models/TeamMember.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { removeUpload } from '../utils/files.js';

// GET /api/team
export const getTeam = asyncHandler(async (req, res) => {
  const data = await TeamMember.findAll();
  res.json({ success: true, count: data.length, data });
});

// POST /api/team  (admin, multipart: name, role, photo, …)
export const createMember = asyncHandler(async (req, res) => {
  const data = await TeamMember.create({ ...req.body, photo_file: req.file?.filename });
  res.status(201).json({ success: true, data });
});

// PUT /api/team/:id  (admin; a new photo replaces the old one)
export const updateMember = asyncHandler(async (req, res) => {
  const existing = await TeamMember.findRaw(req.params.id);
  if (!existing) throw new AppError('Team member not found.', 404);
  const patch = { ...req.body };
  if (req.file) patch.photo_file = req.file.filename;
  const data = await TeamMember.update(req.params.id, patch);
  if (req.file) removeUpload('team', existing.photo_file);
  res.json({ success: true, data });
});

// DELETE /api/team/:id  (admin)
export const deleteMember = asyncHandler(async (req, res) => {
  const existing = await TeamMember.findRaw(req.params.id);
  if (!existing) throw new AppError('Team member not found.', 404);
  await TeamMember.remove(req.params.id);
  removeUpload('team', existing.photo_file);
  res.json({ success: true, message: 'Team member removed.' });
});
