import GalleryImage from '../models/GalleryImage.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { removeUpload } from '../utils/files.js';

// GET /api/gallery
export const getGallery = asyncHandler(async (req, res) => {
  const data = await GalleryImage.findAll();
  res.json({ success: true, count: data.length, data });
});

// POST /api/gallery  (admin, multipart: title, caption, image)
export const addImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Please choose an image to upload.', 422, [{ field: 'image', message: 'An image is required.' }]);
  const data = await GalleryImage.create({ title: req.body.title, caption: req.body.caption, image_file: req.file.filename });
  res.status(201).json({ success: true, data });
});

// PUT /api/gallery/:id  (admin: title / caption)
export const updateImage = asyncHandler(async (req, res) => {
  if (!(await GalleryImage.findRaw(req.params.id))) throw new AppError('Image not found.', 404);
  res.json({ success: true, data: await GalleryImage.update(req.params.id, req.body) });
});

// DELETE /api/gallery/:id  (admin)
export const deleteImage = asyncHandler(async (req, res) => {
  const existing = await GalleryImage.findRaw(req.params.id);
  if (!existing) throw new AppError('Image not found.', 404);
  await GalleryImage.remove(req.params.id);
  removeUpload('gallery', existing.image_file);
  res.json({ success: true, message: 'Image deleted.' });
});
