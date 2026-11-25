import Event from '../models/Event.js';
import { Emails } from '../services/emailTemplates.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const findOr404 = async (id) => {
  const ev = await Event.findById(id);
  if (!ev) throw new AppError('Event not found.', 404);
  return ev;
};

// GET /api/events?scope=upcoming|past|all
export const getEvents = asyncHandler(async (req, res) => {
  const scope = ['upcoming', 'past'].includes(req.query.scope) ? req.query.scope : 'all';
  const data = await Event.findAll({ scope });
  res.json({ success: true, count: data.length, data });
});

// GET /api/events/:id
export const getEvent = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOr404(req.params.id) });
});

// POST /api/events/:id/register
export const registerForEvent = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const ev = await Event.register(req.params.id, { name, email, userId: req.user?.id ?? null });
  Emails.eventRegistration({ name, email, event: ev });
  res.status(201).json({ success: true, message: `You’re registered for ${ev.title}. A confirmation email is on its way.` });
});

// POST /api/events  (admin)
export const createEvent = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Event.create(req.body) });
});

// PUT /api/events/:id  (admin)
export const updateEvent = asyncHandler(async (req, res) => {
  await findOr404(req.params.id);
  res.json({ success: true, data: await Event.update(req.params.id, req.body) });
});

// DELETE /api/events/:id  (admin)
export const deleteEvent = asyncHandler(async (req, res) => {
  if (!(await Event.remove(req.params.id))) throw new AppError('Event not found.', 404);
  res.json({ success: true, message: 'Event deleted.' });
});

// GET /api/admin/events/:id/registrations
export const getRegistrations = asyncHandler(async (req, res) => {
  await findOr404(req.params.id);
  const data = await Event.registrations(req.params.id);
  res.json({ success: true, count: data.length, data });
});
