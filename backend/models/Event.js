import { pool } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { buildUpdate, toSqlDateTime } from '../utils/helpers.js';

const toEvent = (r) => {
  const registered = Number(r.registered || 0);
  const capacity = Number(r.capacity || 0);
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    description: r.description,
    location: r.location,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    capacity,
    registered,
    spotsLeft: capacity ? Math.max(capacity - registered, 0) : null,
    isFull: capacity > 0 && registered >= capacity,
    icon: r.icon,
    art: r.art,
  };
};

const BASE = `SELECT e.*, (SELECT COUNT(*) FROM event_registrations x WHERE x.event_id = e.id) AS registered FROM events e`;
const FIELDS = ['title', 'type', 'description', 'location', 'starts_at', 'ends_at', 'capacity', 'icon', 'art'];

const Event = {
  async findAll({ scope = 'all' } = {}) {
    const where = scope === 'upcoming' ? 'WHERE e.starts_at >= NOW()' : scope === 'past' ? 'WHERE e.starts_at < NOW()' : '';
    const order = scope === 'past' ? 'DESC' : 'ASC';
    const [rows] = await pool.query(`${BASE} ${where} ORDER BY e.starts_at ${order}, e.id ASC`);
    return rows.map(toEvent);
  },

  async findById(id) {
    const [rows] = await pool.query(`${BASE} WHERE e.id = ? LIMIT 1`, [id]);
    return rows[0] ? toEvent(rows[0]) : null;
  },

  async create(d) {
    const [res] = await pool.query(
      `INSERT INTO events (title, type, description, location, starts_at, ends_at, capacity, icon, art)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.title, d.type || 'Workshop', d.description, d.location || 'Software Engineering Lab',
        toSqlDateTime(d.starts_at), toSqlDateTime(d.ends_at), d.capacity ?? 0,
        d.icon || 'bi-calendar-event-fill', d.art || 'a1',
      ]
    );
    return this.findById(res.insertId);
  },

  async update(id, data) {
    const patch = { ...data };
    if (patch.starts_at !== undefined) patch.starts_at = toSqlDateTime(patch.starts_at);
    if (patch.ends_at !== undefined) patch.ends_at = toSqlDateTime(patch.ends_at);
    const { setSql, values } = buildUpdate(patch, FIELDS);
    if (!setSql) return this.findById(id);
    await pool.query(`UPDATE events SET ${setSql} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return res.affectedRows > 0;
  },

  /** Registers an attendee, enforcing capacity and one registration per email. */
  async register(eventId, { name, email, userId = null }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Lock the event row so two people cannot take the last seat at once.
      const [[ev]] = await conn.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [eventId]);
      if (!ev) throw new AppError('Event not found.', 404);
      if (new Date(String(ev.starts_at).replace(' ', 'T')) < new Date()) throw new AppError('This event has already taken place.', 400);
      if (ev.capacity > 0) {
        const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM event_registrations WHERE event_id = ?', [eventId]);
        if (n >= ev.capacity) throw new AppError('Sorry, this event is full.', 409);
      }
      try {
        await conn.query('INSERT INTO event_registrations (event_id, user_id, name, email) VALUES (?, ?, ?, ?)', [eventId, userId, name, email]);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('This email is already registered for the event.', 409);
        throw err;
      }
      await conn.commit();
      return ev;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async registrations(eventId) {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM event_registrations WHERE event_id = ? ORDER BY created_at ASC',
      [eventId]
    );
    return rows;
  },

  async findForUser(user) {
    const [rows] = await pool.query(
      `${BASE} WHERE e.id IN (SELECT event_id FROM event_registrations WHERE user_id = ? OR email = ?) ORDER BY e.starts_at ASC`,
      [user.id, user.email]
    );
    return rows.map(toEvent);
  },
};

export default Event;
