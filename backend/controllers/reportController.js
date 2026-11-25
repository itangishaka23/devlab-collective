import fs from 'node:fs';
import path from 'node:path';
import env from '../config/env.js';
import Report from '../models/Report.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { removeUpload } from '../utils/files.js';

// GET /api/reports
export const getReports = asyncHandler(async (req, res) => {
  const data = await Report.findAll();
  res.json({ success: true, count: data.length, data });
});

// GET /api/reports/:id/download
export const downloadReport = asyncHandler(async (req, res) => {
  const report = await Report.findRaw(req.params.id);
  if (!report || !report.file_name) throw new AppError('This report has no file yet.', 404);

  const file = path.join(env.uploadDir, 'reports', path.basename(report.file_name));
  if (!fs.existsSync(file)) throw new AppError('The report file is missing on the server.', 404);

  await Report.countDownload(report.id);
  const safeName = `${report.title.replace(/[^\w\s.-]/g, '').trim() || 'report'}.pdf`;
  res.download(file, safeName);
});

// POST /api/reports  (admin, multipart: title, subtitle, year, file)
export const createReport = asyncHandler(async (req, res) => {
  const data = await Report.create({
    ...req.body,
    file_name: req.file?.filename,
    size_bytes: req.file?.size,
  });
  res.status(201).json({ success: true, data });
});

// PUT /api/reports/:id  (admin; a new file replaces the old one)
export const updateReport = asyncHandler(async (req, res) => {
  const existing = await Report.findRaw(req.params.id);
  if (!existing) throw new AppError('Report not found.', 404);
  const patch = { ...req.body };
  if (req.file) {
    patch.file_name = req.file.filename;
    patch.size_bytes = req.file.size;
  }
  const data = await Report.update(req.params.id, patch);
  if (req.file) removeUpload('reports', existing.file_name);
  res.json({ success: true, data });
});

// DELETE /api/reports/:id  (admin)
export const deleteReport = asyncHandler(async (req, res) => {
  const existing = await Report.findRaw(req.params.id);
  if (!existing) throw new AppError('Report not found.', 404);
  await Report.remove(req.params.id);
  removeUpload('reports', existing.file_name);
  res.json({ success: true, message: 'Report deleted.' });
});
