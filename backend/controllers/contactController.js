import ContactMessage from '../models/ContactMessage.js';
import { Emails } from '../services/emailTemplates.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/contact
export const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  const subject = req.body.subject || 'Other';
  await ContactMessage.create({ name, email, subject, message, ip: req.ip });
  Emails.contactReceived({ name, email, subject, message });
  res.status(201).json({ success: true, message: 'Thanks! Your message has been sent. We’ll reply soon.' });
});
