import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const bool = (v, d = false) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()));
const port = Number(process.env.PORT) || 5000;

const DEFAULT_JWT = 'dev-only-secret-change-me';
const DEFAULT_ADMIN_PASSWORD = 'ChangeMe123!';

const env = {
  nodeEnv,
  isProd,
  port,
  publicUrl: (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  uploadDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads'),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'devlab_db',
  },
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  admin: {
    name: process.env.ADMIN_NAME || 'Lab Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@devlab.local').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'DevLab Collective <no-reply@devlab.local>',
    notifyTo: process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'admin@devlab.local',
  },
  turnstileSecret: process.env.TURNSTILE_SECRET || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  commentsAutoApprove: bool(process.env.COMMENTS_AUTO_APPROVE, false),
  siteUrl: (process.env.SITE_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]).trim().replace(/\/$/, ''),
};

// ---- Production safety checks: refuse to start with insecure defaults ----
if (isProd) {
  const problems = [];
  if (env.jwtSecret === DEFAULT_JWT || env.jwtSecret.length < 32) problems.push('JWT_SECRET must be set to a random string of at least 32 characters.');
  if (env.admin.password === DEFAULT_ADMIN_PASSWORD) problems.push('ADMIN_PASSWORD must be changed from the default.');
  if (!env.db.password && env.db.user === 'root') problems.push('Do not use the MySQL root user with an empty password in production.');
  if (problems.length) throw new Error(`Insecure production configuration:\n - ${problems.join('\n - ')}`);
} else if (env.jwtSecret === DEFAULT_JWT) {
  console.warn('! Using the development JWT secret. Set JWT_SECRET in .env before deploying.');
}

export default env;
