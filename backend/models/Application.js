import { pool } from '../config/db.js';

const Application = {
  async hasPending(email) {
    const [rows] = await pool.query("SELECT id FROM applications WHERE email = ? AND status = 'pending' LIMIT 1", [email]);
    return rows.length > 0;
  },

  async create(d) {
    const [res] = await pool.query(
      `INSERT INTO applications (name, email, phone, track, level, skills, availability_hours, github, motivation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.name, d.email, d.phone || null, d.track, d.level, d.skills || null, d.availability_hours ?? 6, d.github || null, d.motivation]
    );
    return res.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findAll({ status } = {}) {
    const [rows] = await pool.query(
      `SELECT * FROM applications ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC, id DESC`,
      status ? [status] : []
    );
    return rows;
  },

  async updateStatus(id, { status, admin_note }) {
    await pool.query('UPDATE applications SET status = ?, admin_note = ? WHERE id = ?', [status, admin_note || null, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default Application;
