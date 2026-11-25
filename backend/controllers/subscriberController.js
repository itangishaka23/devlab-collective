import Subscriber from '../models/Subscriber.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/subscribers
export const subscribe = asyncHandler(async (req, res) => {
  const added = await Subscriber.add(req.body.email, req.body.source || 'website');
  // Same friendly answer either way, so the form can't be used to probe who is subscribed.
  res.status(added ? 201 : 200).json({ success: true, message: 'You’re subscribed — thank you!' });
});
