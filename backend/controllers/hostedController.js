import HostedProject from '../models/HostedProject.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { removeUpload } from '../utils/files.js';

// GET /api/hosted-projects?limit=3
export const getHostedProjects = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 0, 50) || undefined;
  const data = await HostedProject.findAll({ limit });
  res.json({ success: true, count: data.length, data });
});

// GET /api/hosted-projects/:ref   (id or slug)
export const getHostedProject = asyncHandler(async (req, res) => {
  const project = await HostedProject.findByRef(req.params.ref);
  if (!project) throw new AppError('Hosted project not found.', 404);
  res.json({ success: true, data: project });
});

// POST /api/hosted-projects  (admin, multipart: title, summary, live_url, tech, …, screenshot)
export const createHostedProject = asyncHandler(async (req, res) => {
  const data = await HostedProject.create({ ...req.body, screenshot_file: req.file?.filename });
  res.status(201).json({ success: true, data });
});

// PUT /api/hosted-projects/:id  (admin; a new screenshot replaces the old one)
export const updateHostedProject = asyncHandler(async (req, res) => {
  const existing = await HostedProject.findRaw(req.params.id);
  if (!existing) throw new AppError('Hosted project not found.', 404);
  const patch = { ...req.body };
  if (req.file) patch.screenshot_file = req.file.filename;
  const data = await HostedProject.update(req.params.id, patch);
  if (req.file) removeUpload('hosted', existing.screenshot_file);
  res.json({ success: true, data });
});

// DELETE /api/hosted-projects/:id  (admin)
export const deleteHostedProject = asyncHandler(async (req, res) => {
  const existing = await HostedProject.findRaw(req.params.id);
  if (!existing) throw new AppError('Hosted project not found.', 404);
  await HostedProject.remove(req.params.id);
  removeUpload('hosted', existing.screenshot_file);
  res.json({ success: true, message: 'Hosted project removed.' });
});
