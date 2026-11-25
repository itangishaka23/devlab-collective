import { body, param, query } from 'express-validator';

// ---------- reusable pieces ----------
const email = (field = 'email') =>
  body(field)
    .trim()
    .isEmail().withMessage('Please enter a valid email address.')
    .isLength({ max: 150 }).withMessage('Email is too long.')
    .customSanitizer((v) => v.toLowerCase());

const personName = body('name')
  .trim()
  .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.');

const strongPassword = (field) =>
  body(field)
    .isString().withMessage('Password is required.')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters.')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter.')
    .matches(/\d/).withMessage('Password must contain a number.');

const optional = (isCreate) => (chain) => (isCreate ? chain : chain.optional());

export const idParam = param('id').isInt({ min: 1 }).withMessage('Invalid id.').toInt();
const art = body('art').optional().matches(/^a[1-6]$/).withMessage('art must be one of a1–a6.');
const icon = body('icon').optional({ values: 'falsy' }).trim().matches(/^bi-[a-z0-9-]+$/).withMessage('icon must be a Bootstrap Icons class, e.g. bi-code-slash.');
const httpUrl = (field) =>
  body(field).optional({ values: 'falsy' }).trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Must be a full http(s) URL.');

// ---------- auth / account ----------
export const registerRules = [personName, email(), strongPassword('password')];
export const loginRules = [email(), body('password').isString().notEmpty().withMessage('Password is required.')];
export const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('bio').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Bio must be 500 characters or fewer.'),
  body('github').optional({ values: 'falsy' }).trim().matches(/^[A-Za-z0-9-]{1,39}$/).withMessage('Enter your GitHub username only, e.g. octocat.'),
];
export const passwordChangeRules = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
  strongPassword('newPassword'),
];

// ---------- public forms ----------
export const contactRules = [
  personName,
  email(),
  body('subject').optional({ values: 'falsy' }).trim().isLength({ max: 150 }).withMessage('Subject is too long.'),
  body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5–2000 characters.'),
];
export const subscribeRules = [email(), body('source').optional().trim().isLength({ max: 40 })];
export const interestRules = [idParam, personName, email()];
export const eventRegisterRules = [idParam, personName, email()];

export const applicationRules = [
  personName,
  email(),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[0-9+()\-\s]{6,25}$/).withMessage('Enter a valid phone number.'),
  body('track').trim().isLength({ min: 2, max: 60 }).withMessage('Please choose a track.'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Please choose your experience level.'),
  body('skills').optional({ values: 'falsy' }).trim().isLength({ max: 300 }).withMessage('Skills must be 300 characters or fewer.'),
  body('availability_hours').isInt({ min: 1, max: 40 }).withMessage('Hours per week must be between 1 and 40.').toInt(),
  body('github').optional({ values: 'falsy' }).trim().matches(/^[A-Za-z0-9-]{1,39}$/).withMessage('Enter your GitHub username only, e.g. octocat.'),
  body('motivation').trim().isLength({ min: 20, max: 2000 }).withMessage('Please tell us a little more (20–2000 characters).'),
];

export const commentRules = [body('body').trim().isLength({ min: 2, max: 1000 }).withMessage('Comment must be 2–1000 characters.')];
export const reactionRules = [body('type').isIn(['like', 'insightful', 'celebrate']).withMessage('Unknown reaction.')];

// ---------- list queries ----------
export const listQueryRules = [
  query('category').optional().trim().isLength({ max: 50 }),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1, max: 10000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

// ---------- admin content ----------
export const projectRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('title').trim().isLength({ min: 2, max: 150 })).withMessage('Title is required (2–150 chars).'),
    opt(body('tag').trim().isLength({ min: 1, max: 50 })).withMessage('Tag is required.'),
    opt(body('blurb').trim().isLength({ min: 5, max: 500 })).withMessage('Blurb is required (5–500 chars).'),
    opt(body('stack').isArray({ min: 1, max: 12 })).withMessage('Stack must be a non-empty array.'),
    body('stack.*').optional().isString().trim().isLength({ max: 40 }),
    body('description').optional({ values: 'falsy' }).isString().isLength({ max: 8000 }),
    body('roadmap').optional().isArray({ max: 20 }).withMessage('Roadmap must be an array.'),
    body('roadmap.*.title').optional().isString().trim().isLength({ min: 1, max: 120 }),
    body('roadmap.*.done').optional().isBoolean(),
    icon,
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be 0–100.').toInt(),
    body('milestone').optional().trim().isLength({ max: 80 }),
    body('status').optional().trim().isLength({ max: 50 }),
    body('lead').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
    body('github_repo').optional({ values: 'falsy' }).trim().matches(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/).withMessage('Use the form owner/repository.'),
    httpUrl('demo_url'),
    art,
  ];
};

export const postRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('title').trim().isLength({ min: 3, max: 200 })).withMessage('Title is required.'),
    opt(body('excerpt').trim().isLength({ min: 5, max: 500 })).withMessage('Excerpt is required.'),
    opt(body('category').trim().isLength({ min: 1, max: 50 })).withMessage('Category is required.'),
    opt(body('author').isObject()).withMessage('Author must be an object with name, role, bio.'),
    body('content').optional({ values: 'falsy' }).isString().isLength({ max: 100000 }).withMessage('Article text is too long.'),
    body('body').optional().isArray().withMessage('Body must be an array of blocks.'),
    body('slug').optional().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be lowercase letters, numbers and dashes.'),
    body('tags').optional().isArray({ max: 10 }),
    body('published').optional().isBoolean().toBoolean(),
    body('published_at').optional().isISO8601().withMessage('published_at must be YYYY-MM-DD.'),
    body('read_time').optional().trim().isLength({ max: 30 }),
    icon,
    art,
    // On create, an article needs some content in either format.
    ...(isCreate
      ? [body().custom((b) => (typeof b.content === 'string' && b.content.trim()) || (Array.isArray(b.body) && b.body.length)).withMessage('Write the article text (content) before saving.')]
      : []),
  ];
};

export const faqRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('category').trim().isLength({ min: 1, max: 40 })).withMessage('Category is required.'),
    opt(body('question').trim().isLength({ min: 5, max: 300 })).withMessage('Question is required.'),
    opt(body('answer').trim().isLength({ min: 5, max: 5000 })).withMessage('Answer is required.'),
    body('sort_order').optional().isInt().toInt(),
  ];
};

export const eventRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('title').trim().isLength({ min: 3, max: 160 })).withMessage('Title is required.'),
    opt(body('description').trim().isLength({ min: 5, max: 3000 })).withMessage('Description is required.'),
    opt(body('starts_at').isISO8601()).withMessage('Start date/time is required.'),
    body('ends_at').optional({ values: 'falsy' }).isISO8601().withMessage('End must be a valid date/time.'),
    body('type').optional().trim().isLength({ min: 2, max: 40 }),
    body('location').optional().trim().isLength({ max: 150 }),
    body('capacity').optional({ values: 'falsy' }).isInt({ min: 0, max: 100000 }).withMessage('Capacity must be 0 or more (0 = unlimited).').toInt(),
    icon,
    art,
  ];
};

export const reportRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('title').trim().isLength({ min: 3, max: 200 })).withMessage('Title is required.'),
    body('subtitle').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
    body('year').optional({ values: 'falsy' }).isInt({ min: 2000, max: 2100 }).toInt(),
  ];
};

export const galleryRules = (isCreate) => [
  optional(isCreate)(body('title').trim().isLength({ min: 2, max: 150 })).withMessage('Title is required.'),
  body('caption').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
];

export const teamRules = (isCreate) => {
  const opt = optional(isCreate);
  const color = (f) => body(f).optional({ values: 'falsy' }).matches(/^#[0-9a-fA-F]{6}$/).withMessage('Use a hex colour like #1b6fd1.');
  return [
    opt(body('name').trim().isLength({ min: 2, max: 100 })).withMessage('Name is required.'),
    opt(body('role').trim().isLength({ min: 2, max: 100 })).withMessage('Role is required.'),
    httpUrl('github'), httpUrl('linkedin'), httpUrl('x'),
    color('color_a'), color('color_b'),
    body('sort_order').optional({ values: 'falsy' }).isInt().toInt(),
  ];
};

// ---------- moderation ----------
export const messageStatusRules = [idParam, body('status').isIn(['new', 'read', 'archived']).withMessage('Status must be new, read or archived.')];
export const commentStatusRules = [idParam, body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status.')];
export const applicationStatusRules = [
  idParam,
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status.'),
  body('admin_note').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];

// ---------- hosted (live) projects ----------
// Multipart forms send lists as text: accept a JSON array ('["React","Node"]') or comma-separated text.
const parseList = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return v;
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  return v.split(',').map((x) => x.trim()).filter(Boolean);
};

export const hostedRules = (isCreate) => {
  const opt = optional(isCreate);
  return [
    opt(body('title').trim().isLength({ min: 2, max: 150 })).withMessage('Title is required (2–150 chars).'),
    opt(body('summary').trim().isLength({ min: 5, max: 500 })).withMessage('Summary is required (5–500 chars).'),
    opt(body('live_url').trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 255 })).withMessage('Enter the full live address, starting with https://'),
    httpUrl('repo_url'),
    body('description').optional({ values: 'falsy' }).isString().isLength({ max: 8000 }),
    opt(body('tech').customSanitizer(parseList).isArray({ min: 1, max: 12 })).withMessage('Add at least one technology.'),
    body('tech.*').optional().isString().trim().isLength({ max: 40 }),
    body('category').optional().trim().isLength({ min: 2, max: 50 }),
    body('launched_at').optional({ values: 'falsy' }).isISO8601().withMessage('Launch date must be YYYY-MM-DD.'),
    body('featured').optional().isBoolean().toBoolean(),
    body('sort_order').optional({ values: 'falsy' }).isInt().toInt(),
  ];
};
