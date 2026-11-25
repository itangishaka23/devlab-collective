import { pool } from '../config/db.js';

const Subscriber = {
  /** Returns true if newly added, false if the email was already subscribed. */
  async add(email, source = 'website') {
    const [res] = await pool.query('INSERT IGNORE INTO subscribers (email, source) VALUES (?, ?)', [email, source]);
    return res.affectedRows > 0;
  },

  async findAll() {
    const [rows] = await pool.query('SELECT id, email, source, created_at FROM subscribers ORDER BY created_at DESC, id DESC');
    return rows;
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM subscribers WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default Subscriber;
