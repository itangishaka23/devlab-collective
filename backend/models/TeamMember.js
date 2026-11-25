import { pool } from '../config/db.js';
import { buildUpdate } from '../utils/helpers.js';
import { uploadUrl } from '../utils/files.js';

const toMember = (r) => ({
  id: r.id,
  name: r.name,
  role: r.role,
  photo: uploadUrl('team', r.photo_file),
  github: r.github || '',
  linkedin: r.linkedin || '',
  x: r.x_handle || '',
  a: r.color_a,
  b: r.color_b,
  sort_order: r.sort_order,
});

const TeamMember = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    return rows.map(toMember);
  },

  async findRaw(id) {
    const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(d) {
    const [[{ next }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM team_members');
    const [res] = await pool.query(
      `INSERT INTO team_members (name, role, photo_file, github, linkedin, x_handle, color_a, color_b, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.name, d.role, d.photo_file || null, d.github || null, d.linkedin || null, d.x || null, d.color_a || '#1b6fd1', d.color_b || '#0f4c9e', d.sort_order ?? next]
    );
    return toMember(await this.findRaw(res.insertId));
  },

  async update(id, data) {
    const mapped = { ...data, x_handle: data.x };
    const { setSql, values } = buildUpdate(mapped, ['name', 'role', 'photo_file', 'github', 'linkedin', 'x_handle', 'color_a', 'color_b', 'sort_order']);
    if (setSql) await pool.query(`UPDATE team_members SET ${setSql} WHERE id = ?`, [...values, id]);
    return toMember(await this.findRaw(id));
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },
};

export default TeamMember;
