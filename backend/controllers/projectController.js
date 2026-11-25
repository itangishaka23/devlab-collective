import Project from '../models/Project.js';
import { Emails } from '../services/emailTemplates.js';
import { getRepoStats } from '../services/github.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const findOr404 = async (ref) => {
  const project = await Project.findByRef(ref);
  if (!project) throw new AppError('Project not found.', 404);
  return project;
};

// GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const data = await Project.findAll();
  res.json({ success: true, count: data.length, data });
});

// GET /api/projects/:ref   (numeric id or slug)
export const getProject = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOr404(req.params.ref) });
});

// GET /api/projects/:ref/github   (live repository stats)
export const getProjectGithub = asyncHandler(async (req, res) => {
  const project = await findOr404(req.params.ref);
  res.json({ success: true, data: await getRepoStats(project.github_repo) });
});

// POST /api/projects/:id/interest  (public; links the member account when logged in)
export const addInterest = asyncHandler(async (req, res) => {
  const project = await findOr404(req.params.id);
  const { name, email } = req.body;
  await Project.addInterest(project.id, { name, email, userId: req.user?.id ?? null });
  Emails.projectInterest({ name, email, project });
  res.status(201).json({ success: true, message: `Thanks! We’ve noted your interest in ${project.title}.` });
});

// POST /api/projects  (admin)
export const createProject = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Project.create(req.body) });
});

// PUT /api/projects/:id  (admin)
export const updateProject = asyncHandler(async (req, res) => {
  await findOr404(req.params.id);
  res.json({ success: true, data: await Project.update(req.params.id, req.body) });
});

// DELETE /api/projects/:id  (admin)
export const deleteProject = asyncHandler(async (req, res) => {
  if (!(await Project.remove(req.params.id))) throw new AppError('Project not found.', 404);
  res.json({ success: true, message: 'Project deleted.' });
});
