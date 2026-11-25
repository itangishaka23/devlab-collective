import { pool } from '../config/db.js';
import { uploadUrl } from '../utils/files.js';
import { buildUpdate, formatDate, parseJson, slugify } from '../utils/helpers.js';

const toHosted = (r) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  summary: r.summary,
  description: r.description || '',
  url: r.live_url,
  repo: r.repo_url || '',
  tech: parseJson(r.tech, []),
  category: r.category,
  screenshot: uploadUrl('hosted', r.screenshot_file),
  launched: r.launched_at ? formatDate(r.launched_at) : '',
  launched_at: r.launched_at ? String(r.launched_at).slice(0, 10) : '',
  featured: Boolean(r.featured),
  sort_order: r.sort_order,
});

const FIELDS = ['title', 'summary', 'description', 'live_url', 'repo_url', 'tech', 'category', 'screenshot_file', 'launched_at', 'featured', 'sort_order'];

const HostedProject = {
  async findAll({ limit } = {}) {
    const [rows] = await pool.query(
      `SELECT * FROM hosted_projects ORDER BY featured DESC, sort_order ASC, launched_at DESC, id DESC ${limit ? 'LIMIT ?' : ''}`,
      limit ? [limit] : []
    );
    return rows.map(toHosted);
  },

  async findRaw(id) {
    const [rows] = await pool.query('SELECT * FROM hosted_projects WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByRef(ref) {
    const isId = /^\d+$/.test(String(ref));
    const [rows] = await pool.query(`SELECT * FROM hosted_projects WHERE ${isId ? 'id' : 'slug'} = ? LIMIT 1`, [ref]);
    return rows[0] ? toHosted(rows[0]) : null;
  },

  async create(d) {
    const [[{ next }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM hosted_projects');
    const [res] = await pool.query(
      `INSERT INTO hosted_projects (slug, title, summary, description, live_url, repo_url, tech, category, screenshot_file, launched_at, featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.slug || slugify(d.title), d.title, d.summary, d.description || null, d.live_url, d.repo_url || null,
        JSON.stringify(d.tech || []), d.category || 'Web App', d.screenshot_file || null, d.launched_at || null,
        d.featured ? 1 : 0, d.sort_order ?? next,
      ]
    );
    return toHosted(await this.findRaw(res.insertId));
  },

  async update(id, data) {
    const patch = { ...data };
    if (patch.featured !== undefined) patch.featured = patch.featured ? 1 : 0;
    if (patch.launched_at === '') patch.launched_at = null;
    const { setSql, values } = buildUpdate(patch, FIELDS, ['tech']);
    if (setSql) await pool.query(`UPDATE hosted_projects SET ${setSql} WHERE id = ?`, [...values, id]);
    return toHosted(await this.findRaw(id));
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM hosted_projects WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default HostedProject;
