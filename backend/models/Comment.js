import { pool } from '../config/db.js';

const toComment = (r) => ({ id: r.id, author: r.author_name, body: r.body, status: r.status, created_at: r.created_at, post_title: r.post_title });

const Comment = {
  async create({ postId, userId, authorName, body, status }) {
    const [res] = await pool.query(
      'INSERT INTO comments (post_id, user_id, author_name, body, status) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, authorName, body, status]
    );
    return res.insertId;
  },

  async findApproved(postId) {
    const [rows] = await pool.query(
      "SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC, id ASC",
      [postId]
    );
    return rows.map(toComment);
  },

  async findAllAdmin({ status } = {}) {
    const [rows] = await pool.query(
      `SELECT c.*, p.title AS post_title FROM comments c JOIN posts p ON p.id = c.post_id
       ${status ? 'WHERE c.status = ?' : ''} ORDER BY c.created_at DESC, c.id DESC`,
      status ? [status] : []
    );
    return rows.map(toComment);
  },

  async setStatus(id, status) {
    const [res] = await pool.query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);
    return res.affectedRows > 0;
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default Comment;
