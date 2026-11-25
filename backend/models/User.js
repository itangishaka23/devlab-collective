import { pool } from '../config/db.js';

const safe = (r) =>
  r && { id: r.id, name: r.name, email: r.email, role: r.role, bio: r.bio || '', github: r.github || '', created_at: r.created_at };

const User = {
  /** Includes password_hash — only for login / password checks. */
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findWithHash(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return safe(rows[0]) || null;
  },

  async create({ name, email, passwordHash, role = 'member' }) {
    const [res] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    return this.findById(res.insertId);
  },

  async updateProfile(id, { name, bio, github }) {
    await pool.query('UPDATE users SET name = COALESCE(?, name), bio = ?, github = ? WHERE id = ?', [
      name ?? null, bio ?? null, github ?? null, id,
    ]);
    return this.findById(id);
  },

  async updatePassword(id, passwordHash) {
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC, id DESC');
    return rows.map(safe);
  },
};

export default User;
