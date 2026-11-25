import Application from '../models/Application.js';
import { Emails } from '../services/emailTemplates.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/applications  (public)
export const submitApplication = asyncHandler(async (req, res) => {
  if (await Application.hasPending(req.body.email)) {
    throw new AppError('You already have an application under review. We’ll be in touch soon.', 409);
  }
  await Application.create(req.body);
  Emails.applicationReceived(req.body);
  res.status(201).json({ success: true, message: 'Application received! A mentor will review it and reply by email.' });
});

// GET /api/admin/applications?status=pending
export const getApplications = asyncHandler(async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : undefined;
  const data = await Application.findAll({ status });
  res.json({ success: true, count: data.length, data });
});

// PATCH /api/admin/applications/:id   { status, admin_note }
export const reviewApplication = asyncHandler(async (req, res) => {
  const existing = await Application.findById(req.params.id);
  if (!existing) throw new AppError('Application not found.', 404);
  const updated = await Application.updateStatus(req.params.id, req.body);
  // Email the applicant only when the decision changes to approved / rejected
  if (updated.status !== existing.status && updated.status !== 'pending') Emails.applicationStatus(updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/admin/applications/:id
export const deleteApplication = asyncHandler(async (req, res) => {
  if (!(await Application.remove(req.params.id))) throw new AppError('Application not found.', 404);
  res.json({ success: true, message: 'Application deleted.' });
});
