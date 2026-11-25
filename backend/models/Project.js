import { pool } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { buildUpdate, parseJson, slugify } from '../utils/helpers.js';

const toProject = (r) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  tag: r.tag,
  icon: r.icon,
  blurb: r.blurb,
  description: r.description || '',
  stack: parseJson(r.stack, []),
  roadmap: parseJson(r.roadmap, []),
  progress: r.progress,
  milestone: r.milestone,
  status: r.status,
  art: r.art,
  lead: r.lead || '',
  github_repo: r.github_repo || '',
  demo_url: r.demo_url || '',
  interests: r.interest_count,
});

const FIELDS = [
  'title', 'tag', 'icon', 'blurb', 'description', 'stack', 'roadmap', 'progress', 'milestone',
  'status', 'art', 'lead', 'github_repo', 'demo_url', 'sort_order',
];

const Project = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC');
    return rows.map(toProject);
  },

  /** Look up by numeric id or by slug. */
  async findByRef(ref) {
    const isId = /^\d+$/.test(String(ref));
    const [rows] = await pool.query(`SELECT * FROM projects WHERE ${isId ? 'id' : 'slug'} = ? LIMIT 1`, [ref]);
    return rows[0] ? toProject(rows[0]) : null;
  },

  findById(id) {
    return this.findByRef(String(id));
  },

  async create(d) {
    const [[{ next }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM projects');
    const [res] = await pool.query(
      `INSERT INTO projects (slug, title, tag, icon, blurb, description, stack, roadmap, progress, milestone,
                             status, art, lead, github_repo, demo_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.slug || slugify(d.title), d.title, d.tag, d.icon || 'bi-code-slash', d.blurb, d.description || null,
        JSON.stringify(d.stack || []), JSON.stringify(d.roadmap || []), d.progress ?? 0, d.milestone || '',
        d.status || 'In development', d.art || 'a1', d.lead || null, d.github_repo || null, d.demo_url || null,
        d.sort_order ?? next,
      ]
    );
    return this.findById(res.insertId);
  },

  async update(id, data) {
    const { setSql, values } = buildUpdate(data, FIELDS, ['stack', 'roadmap']);
    if (!setSql) return this.findById(id);
    await pool.query(`UPDATE projects SET ${setSql} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },

  /** Records interest in a project; one entry per email per project. */
  async addInterest(projectId, { name, email, userId = null }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      try {
        await conn.query('INSERT INTO project_interests (project_id, user_id, name, email) VALUES (?, ?, ?, ?)', [
          projectId, userId, name, email,
        ]);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('You have already shown interest in this project.', 409);
        throw err;
      }
      await conn.query(
        'UPDATE projects SET interest_count = (SELECT COUNT(*) FROM project_interests WHERE project_id = ?) WHERE id = ?',
        [projectId, projectId]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /** Projects a member has joined (by account or by the email they used). */
  async findForUser(user) {
    const [rows] = await pool.query(
      `SELECT DISTINCT p.* FROM projects p
       JOIN project_interests i ON i.project_id = p.id
       WHERE i.user_id = ? OR i.email = ? ORDER BY p.sort_order ASC`,
      [user.id, user.email]
    );
    return rows.map(toProject);
  },
};

export default Project;
