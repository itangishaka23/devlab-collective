import Faq from '../models/Faq.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/faqs?category=joining&search=sprint
export const getFaqs = asyncHandler(async (req, res) => {
  const data = await Faq.findAll({ category: req.query.category, search: req.query.search });
  res.json({ success: true, count: data.length, data });
});

// POST /api/faqs  (admin)
export const createFaq = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Faq.create(req.body) });
});

// PUT /api/faqs/:id  (admin)
export const updateFaq = asyncHandler(async (req, res) => {
  if (!(await Faq.findById(req.params.id))) throw new AppError('FAQ not found.', 404);
  res.json({ success: true, data: await Faq.update(req.params.id, req.body) });
});

// DELETE /api/faqs/:id  (admin)
export const deleteFaq = asyncHandler(async (req, res) => {
  if (!(await Faq.remove(req.params.id))) throw new AppError('FAQ not found.', 404);
  res.json({ success: true, message: 'FAQ deleted.' });
});
