import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/posts?category=DevOps&search=ci&page=1&limit=6
export const getPosts = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const { items, total } = await Post.findPage({ category: req.query.category, search: req.query.search, page, limit });
  res.json({
    success: true,
    count: items.length,
    data: items,
    meta: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/posts/:slug
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findBySlug(req.params.slug);
  if (!post) throw new AppError('Article not found.', 404);
  res.json({ success: true, data: post });
});

// GET /api/admin/posts  (admin: includes drafts and article text)
export const getAdminPosts = asyncHandler(async (req, res) => {
  const data = await Post.findAllAdmin();
  res.json({ success: true, count: data.length, data });
});

// POST /api/posts  (admin)
export const createPost = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Post.create(req.body) });
});

// PUT /api/posts/:id  (admin)
export const updatePost = asyncHandler(async (req, res) => {
  if (!(await Post.findById(req.params.id))) throw new AppError('Article not found.', 404);
  res.json({ success: true, data: await Post.update(req.params.id, req.body) });
});

// DELETE /api/posts/:id  (admin)
export const deletePost = asyncHandler(async (req, res) => {
  if (!(await Post.remove(req.params.id))) throw new AppError('Article not found.', 404);
  res.json({ success: true, message: 'Article deleted.' });
});
