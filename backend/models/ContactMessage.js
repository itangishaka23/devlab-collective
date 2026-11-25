import { pool } from '../config/db.js';

const ContactMessage = {
  async create({ name, email, subject, message, ip }) {
    const [res] = await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)',
      [name, email, subject || 'Other', message, ip || null]
    );
    return res.insertId;
  },

  async findAll({ status } = {}) {
    const [rows] = await pool.query(
      `SELECT id, name, email, subject, message, status, created_at FROM contact_messages
       ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC, id DESC`,
      status ? [status] : []
    );
    return rows;
  },

  async updateStatus(id, status) {
    const [res] = await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    return res.affectedRows > 0;
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default ContactMessage;
