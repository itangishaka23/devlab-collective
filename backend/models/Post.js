import { pool } from '../config/db.js';
import { buildUpdate, formatDate, parseJson, slugify } from '../utils/helpers.js';

const toPost = (r, withBody = true) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category,
  icon: r.icon,
  art: r.art,
  date: formatDate(r.published_at),
  published_at: String(r.published_at).slice(0, 10),
  read: r.read_time,
  published: Boolean(r.published),
  author: parseJson(r.author, {}),
  tags: parseJson(r.tags, []),
  ...(withBody ? { body: parseJson(r.body, []), content: r.content || '' } : {}),
});

const FIELDS = ['title', 'excerpt', 'category', 'icon', 'art', 'published_at', 'read_time', 'author', 'tags', 'body', 'content', 'published'];

const Post = {
  /** Public, paginated list (published posts only; no article bodies). */
  async findPage({ category, search, page = 1, limit = 6 } = {}) {
    const where = ['published = 1'];
    const params = [];
    if (category && category !== 'All Posts') {
      where.push('category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    const clause = `WHERE ${where.join(' AND ')}`;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM posts ${clause}`, params);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT * FROM posts ${clause} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { items: rows.map((r) => toPost(r, false)), total };
  },

  /** Admin list: includes drafts and article text. */
  async findAllAdmin() {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY published_at DESC, id DESC');
    return rows.map((r) => toPost(r, true));
  },

  async findBySlug(slug, { includeDrafts = false } = {}) {
    const [rows] = await pool.query(`SELECT * FROM posts WHERE slug = ? ${includeDrafts ? '' : 'AND published = 1'} LIMIT 1`, [slug]);
    return rows[0] ? toPost(rows[0]) : null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toPost(rows[0]) : null;
  },

  /** Cheap lookup used by comments / reactions. */
  async findIdBySlug(slug) {
    const [rows] = await pool.query('SELECT id, title FROM posts WHERE slug = ? AND published = 1 LIMIT 1', [slug]);
    return rows[0] || null;
  },

  async create(d) {
    const [res] = await pool.query(
      `INSERT INTO posts (slug, title, excerpt, category, icon, art, published_at, read_time, author, tags, body, content, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.slug || slugify(d.title), d.title, d.excerpt, d.category, d.icon || 'bi-journal-code', d.art || 'a1',
        d.published_at || new Date().toISOString().slice(0, 10), d.read_time || '5 min read',
        JSON.stringify(d.author), JSON.stringify(d.tags || []), JSON.stringify(d.body || []),
        d.content || null, d.published === false ? 0 : 1,
      ]
    );
    return this.findById(res.insertId);
  },

  async update(id, data) {
    const patch = { ...data };
    if (typeof patch.published === 'boolean') patch.published = patch.published ? 1 : 0;
    const { setSql, values } = buildUpdate(patch, FIELDS, ['author', 'tags', 'body']);
    if (!setSql) return this.findById(id);
    await pool.query(`UPDATE posts SET ${setSql} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default Post;
