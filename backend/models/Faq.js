import { pool } from '../config/db.js';
import { buildUpdate } from '../utils/helpers.js';

const toFaq = (r) => ({ id: r.id, cat: r.category, q: r.question, a: r.answer, sort_order: r.sort_order });

const Faq = {
  async findAll({ category, search } = {}) {
    const where = [];
    const params = [];
    if (category && category !== 'all') {
      where.push('category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(question LIKE ? OR answer LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT * FROM faqs ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY sort_order ASC, id ASC`,
      params
    );
    return rows.map(toFaq);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toFaq(rows[0]) : null;
  },

  async create({ category, question, answer, sort_order }) {
    const [[{ next }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM faqs');
    const [res] = await pool.query(
      'INSERT INTO faqs (category, question, answer, sort_order) VALUES (?, ?, ?, ?)',
      [category, question, answer, sort_order ?? next]
    );
    return this.findById(res.insertId);
  },

  async update(id, data) {
    const mapped = { category: data.category, question: data.question, answer: data.answer, sort_order: data.sort_order };
    const { setSql, values } = buildUpdate(mapped, ['category', 'question', 'answer', 'sort_order']);
    if (!setSql) return this.findById(id);
    await pool.query(`UPDATE faqs SET ${setSql} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default Faq;
