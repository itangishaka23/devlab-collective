import { pool } from '../config/db.js';

export const REACTION_TYPES = ['like', 'insightful', 'celebrate'];

const Reaction = {
  async summary(postId, voterKey) {
    const [rows] = await pool.query('SELECT type, COUNT(*) AS n FROM post_reactions WHERE post_id = ? GROUP BY type', [postId]);
    const counts = Object.fromEntries(REACTION_TYPES.map((t) => [t, 0]));
    rows.forEach((r) => { counts[r.type] = Number(r.n); });
    const [mine] = await pool.query('SELECT type FROM post_reactions WHERE post_id = ? AND voter_key = ?', [postId, voterKey]);
    return { counts, mine: mine.map((m) => m.type) };
  },

  /** Adds the reaction, or removes it if this voter already reacted. */
  async toggle(postId, type, voterKey) {
    const [res] = await pool.query('DELETE FROM post_reactions WHERE post_id = ? AND type = ? AND voter_key = ?', [postId, type, voterKey]);
    if (res.affectedRows === 0) {
      await pool.query('INSERT IGNORE INTO post_reactions (post_id, type, voter_key) VALUES (?, ?, ?)', [postId, type, voterKey]);
    }
  },
};

export default Reaction;
