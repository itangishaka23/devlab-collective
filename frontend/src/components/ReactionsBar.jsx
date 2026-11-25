import { useEffect, useState } from 'react';
import { getReactions, toggleReaction } from '../api/services.js';

const TYPES = [
  { type: 'like', icon: 'bi-hand-thumbs-up', label: 'Helpful' },
  { type: 'insightful', icon: 'bi-lightbulb', label: 'Insightful' },
  { type: 'celebrate', icon: 'bi-stars', label: 'Great work' },
];

export default function ReactionsBar({ slug }) {
  const [state, setState] = useState(null); // { counts, mine }
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getReactions(slug).then((s) => alive && setState(s)).catch(() => {});
    return () => { alive = false; };
  }, [slug]);

  if (!state) return null; // API offline or still loading — reactions are optional

  const react = async (type) => {
    setError('');
    try { setState(await toggleReaction(slug, type)); } catch (e) { setError(e.message); }
  };

  return (
    <div className="reactions" role="group" aria-label="React to this article">
      {TYPES.map((t) => {
        const active = state.mine.includes(t.type);
        return (
          <button key={t.type} type="button" className={`reaction-btn ${active ? 'active' : ''}`} aria-pressed={active} onClick={() => react(t.type)}>
            <i className={`bi ${active ? t.icon.replace('-up', '-up-fill') : t.icon}`} /> {t.label}
            <span className="count">{state.counts[t.type]}</span>
          </button>
        );
      })}
      {error && <span className="small text-danger ms-2" role="alert">{error}</span>}
    </div>
  );
}
