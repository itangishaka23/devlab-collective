import crypto from 'node:crypto';
import env from '../config/env.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Reaction from '../models/Reaction.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const postOr404 = async (slug) => {
  const post = await Post.findIdBySlug(slug);
  if (!post) throw new AppError('Article not found.', 404);
  return post;
};

// One reaction per person per type: members by account, visitors by hashed IP + browser.
const voterKey = (req) =>
  crypto.createHash('sha256').update(req.user ? `user:${req.user.id}` : `${req.ip}|${req.get('user-agent') || ''}`).digest('hex').slice(0, 40);

// GET /api/posts/:slug/comments
export const getComments = asyncHandler(async (req, res) => {
  const post = await postOr404(req.params.slug);
  res.json({ success: true, data: await Comment.findApproved(post.id) });
});

// POST /api/posts/:slug/comments  (members only)
export const addComment = asyncHandler(async (req, res) => {
  const post = await postOr404(req.params.slug);
  const approved = env.commentsAutoApprove || req.user.role === 'admin';
  await Comment.create({
    postId: post.id,
    userId: req.user.id,
    authorName: req.user.name,
    body: req.body.body,
    status: approved ? 'approved' : 'pending',
  });
  res.status(201).json({
    success: true,
    approved,
    message: approved ? 'Comment posted.' : 'Thanks! Your comment will appear once a moderator approves it.',
  });
});

// GET /api/posts/:slug/reactions
export const getReactions = asyncHandler(async (req, res) => {
  const post = await postOr404(req.params.slug);
  res.json({ success: true, data: await Reaction.summary(post.id, voterKey(req)) });
});

// POST /api/posts/:slug/reactions   { type }  → toggles
export const toggleReaction = asyncHandler(async (req, res) => {
  const post = await postOr404(req.params.slug);
  await Reaction.toggle(post.id, req.body.type, voterKey(req));
  res.json({ success: true, data: await Reaction.summary(post.id, voterKey(req)) });
});

// ---- admin moderation ----
// GET /api/admin/comments?status=pending
export const getAdminComments = asyncHandler(async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : undefined;
  const data = await Comment.findAllAdmin({ status });
  res.json({ success: true, count: data.length, data });
});

// PATCH /api/admin/comments/:id
export const setCommentStatus = asyncHandler(async (req, res) => {
  if (!(await Comment.setStatus(req.params.id, req.body.status))) throw new AppError('Comment not found.', 404);
  res.json({ success: true, message: 'Comment updated.' });
});

// DELETE /api/admin/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  if (!(await Comment.remove(req.params.id))) throw new AppError('Comment not found.', 404);
  res.json({ success: true, message: 'Comment deleted.' });
});
