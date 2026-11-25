// Creates the database + tables from database/schema.sql, upgrades older databases, and seeds sample data.
//   npm run db:init     → create/upgrade, then seed any EMPTY tables (safe to run repeatedly)
//   npm run db:reset    → DROP the database first, then recreate and reseed (deletes all data!)
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, 'database/seed', file), 'utf8'));
const reset = process.argv.includes('--reset');

const { database, ...conn } = env.db;
const connection = await mysql.createConnection({ ...conn, multipleStatements: true, charset: 'utf8mb4' }).catch((err) => {
  console.error('✖ Could not connect to MySQL:', err.code || err.message);
  console.error('  → Start MySQL in the XAMPP Control Panel and check DB_* values in backend/.env');
  process.exit(1);
});

const pad = (n) => String(n).padStart(2, '0');
const sqlDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

// Columns added after the first release. Added automatically to existing databases.
const UPGRADES = [
  ['users', 'bio', 'VARCHAR(500) NULL'],
  ['users', 'github', 'VARCHAR(100) NULL'],
  ['projects', 'description', 'TEXT NULL'],
  ['projects', 'roadmap', 'LONGTEXT NULL'],
  ['projects', 'lead', 'VARCHAR(100) NULL'],
  ['projects', 'github_repo', 'VARCHAR(120) NULL'],
  ['projects', 'demo_url', 'VARCHAR(255) NULL'],
  ['project_interests', 'user_id', 'INT UNSIGNED NULL'],
  ['posts', 'content', 'LONGTEXT NULL'],
  ['posts', 'published', 'TINYINT(1) NOT NULL DEFAULT 1'],
];

try {
  if (reset) {
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    console.log(`• Dropped database ${database}`);
  }

  // schema.sql hard-codes "devlab_db"; swap in DB_NAME if you changed it.
  const schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8').replaceAll('devlab_db', database);
  await connection.query(schema);
  console.log(`• Schema ready in database ${database}`);

  for (const [table, column, ddl] of UPGRADES) {
    const [[{ n }]] = await connection.query(
      'SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [database, table, column]
    );
    if (!n) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${ddl}`);
      console.log(`• Upgraded: added ${table}.${column}`);
    }
  }

  const empty = async (table) => (await connection.query(`SELECT COUNT(*) AS n FROM ${table}`))[0][0].n === 0;

  if (await empty('projects')) {
    for (const p of read('projects.json')) {
      await connection.query(
        `INSERT INTO projects (slug, title, tag, icon, blurb, description, stack, roadmap, progress, milestone, status, art, lead, github_repo, demo_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.slug, p.title, p.tag, p.icon, p.blurb, p.description, JSON.stringify(p.stack), JSON.stringify(p.roadmap), p.progress,
          p.milestone, p.status, p.art, p.lead, p.github_repo, p.demo_url, p.sort_order]
      );
    }
    console.log('• Seeded projects');
  } else {
    // Databases created by v1 have no descriptions/roadmaps — fill them in without touching edited rows.
    for (const p of read('projects.json')) {
      await connection.query(
        'UPDATE projects SET description = ?, roadmap = ?, lead = ? WHERE slug = ? AND description IS NULL',
        [p.description, JSON.stringify(p.roadmap), p.lead, p.slug]
      );
    }
  }

  if (await empty('posts')) {
    for (const p of read('posts.json')) {
      await connection.query(
        `INSERT INTO posts (slug, title, excerpt, category, icon, art, published_at, read_time, author, tags, body)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.slug, p.title, p.excerpt, p.category, p.icon, p.art, p.published_at, p.read_time,
          JSON.stringify(p.author), JSON.stringify(p.tags), JSON.stringify(p.body)]
      );
    }
    console.log('• Seeded blog posts');
  }

  if (await empty('faqs')) {
    for (const f of read('faqs.json')) {
      await connection.query('INSERT INTO faqs (category, question, answer, sort_order) VALUES (?, ?, ?, ?)',
        [f.category, f.question, f.answer, f.sort_order]);
    }
    console.log('• Seeded FAQs');
  }

  if (await empty('team_members')) {
    for (const m of read('team.json')) {
      await connection.query('INSERT INTO team_members (name, role, color_a, color_b, sort_order) VALUES (?, ?, ?, ?, ?)',
        [m.name, m.role, m.color_a, m.color_b, m.sort_order]);
    }
    console.log('• Seeded team members (add photos in the admin dashboard)');
  }

  if (await empty('reports')) {
    for (const r of read('reports.json')) {
      await connection.query('INSERT INTO reports (title, subtitle, year) VALUES (?, ?, ?)', [r.title, r.subtitle, r.year]);
    }
    console.log('• Seeded report entries (upload PDFs in the admin dashboard)');
  }

  if (await empty('events')) {
    for (const e of read('events.json')) {
      const start = new Date();
      start.setDate(start.getDate() + e.offset_days);
      start.setHours(e.hour, 0, 0, 0);
      const end = new Date(start.getTime() + e.duration_h * 3600 * 1000);
      await connection.query(
        `INSERT INTO events (title, type, description, location, starts_at, ends_at, capacity, icon, art)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.title, e.type, e.description, e.location, sqlDate(start), sqlDate(end), e.capacity, e.icon, e.art]
      );
    }
    console.log('• Seeded sample events (dates are relative to today)');
  }

  const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [env.admin.email]);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(env.admin.password, 12);
    await connection.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [env.admin.name, env.admin.email, hash, 'admin']);
    console.log(`• Created admin user ${env.admin.email}`);
  }

  console.log('\n✔ Database ready. Start the API with: npm run dev');
} catch (err) {
  console.error('✖ Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
