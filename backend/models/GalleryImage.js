import { pool } from '../config/db.js';
import { uploadUrl } from '../utils/files.js';

const toImage = (r) => ({ id: r.id, title: r.title, caption: r.caption, url: uploadUrl('gallery', r.image_file), created_at: r.created_at });

const GalleryImage = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM gallery_images ORDER BY created_at DESC, id DESC');
    return rows.map(toImage);
  },

  async findRaw(id) {
    const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ title, caption, image_file }) {
    const [res] = await pool.query('INSERT INTO gallery_images (title, caption, image_file) VALUES (?, ?, ?)', [title, caption || '', image_file]);
    return toImage(await this.findRaw(res.insertId));
  },

  async update(id, { title, caption }) {
    await pool.query('UPDATE gallery_images SET title = COALESCE(?, title), caption = COALESCE(?, caption) WHERE id = ?', [title ?? null, caption ?? null, id]);
    return toImage(await this.findRaw(id));
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default GalleryImage;
