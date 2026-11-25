import ContactMessage from '../models/ContactMessage.js';
import Stats from '../models/Stats.js';
import Subscriber from '../models/Subscriber.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Stats.overview() });
});

// GET /api/admin/messages?status=new
export const getMessages = asyncHandler(async (req, res) => {
  const status = ['new', 'read', 'archived'].includes(req.query.status) ? req.query.status : undefined;
  const data = await ContactMessage.findAll({ status });
  res.json({ success: true, count: data.length, data });
});

// PATCH /api/admin/messages/:id   { status }
export const updateMessageStatus = asyncHandler(async (req, res) => {
  if (!(await ContactMessage.updateStatus(req.params.id, req.body.status))) throw new AppError('Message not found.', 404);
  res.json({ success: true, message: 'Message updated.' });
});

// DELETE /api/admin/messages/:id
export const deleteMessage = asyncHandler(async (req, res) => {
  if (!(await ContactMessage.remove(req.params.id))) throw new AppError('Message not found.', 404);
  res.json({ success: true, message: 'Message deleted.' });
});

// GET /api/admin/subscribers
export const getSubscribers = asyncHandler(async (req, res) => {
  const data = await Subscriber.findAll();
  res.json({ success: true, count: data.length, data });
});

// DELETE /api/admin/subscribers/:id
export const deleteSubscriber = asyncHandler(async (req, res) => {
  if (!(await Subscriber.remove(req.params.id))) throw new AppError('Subscriber not found.', 404);
  res.json({ success: true, message: 'Subscriber removed.' });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const data = await User.findAll();
  res.json({ success: true, count: data.length, data });
});
