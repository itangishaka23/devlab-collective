import { pool } from '../config/db.js';
import { buildUpdate, sizeLabel } from '../utils/helpers.js';

const toReport = (r) => ({
  id: r.id,
  title: r.title,
  sub: r.subtitle,
  year: r.year,
  size: sizeLabel(r.size_bytes),
  downloads: r.downloads,
  hasFile: Boolean(r.file_name),
});

const Report = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM reports ORDER BY year DESC, id DESC');
    return rows.map(toReport);
  },

  async findRaw(id) {
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ title, subtitle, year, file_name, size_bytes }) {
    const [res] = await pool.query(
      'INSERT INTO reports (title, subtitle, year, file_name, size_bytes) VALUES (?, ?, ?, ?, ?)',
      [title, subtitle || '', year || null, file_name || null, size_bytes || 0]
    );
    return toReport(await this.findRaw(res.insertId));
  },

  async update(id, data) {
    const { setSql, values } = buildUpdate(data, ['title', 'subtitle', 'year', 'file_name', 'size_bytes']);
    if (setSql) await pool.query(`UPDATE reports SET ${setSql} WHERE id = ?`, [...values, id]);
    return toReport(await this.findRaw(id));
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM reports WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },

  async countDownload(id) {
    await pool.query('UPDATE reports SET downloads = downloads + 1 WHERE id = ?', [id]);
  },
};

export default Report;
