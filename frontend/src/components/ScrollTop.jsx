import { useEffect, useState } from 'react';
import useScrollY from '../hooks/useScrollY.js';

const R = 23;
const C = 2 * Math.PI * R;

export default function ScrollTop() {
  const y = useScrollY();
  const [max, setMax] = useState(1);

  useEffect(() => {
    const update = () => setMax(Math.max(document.documentElement.scrollHeight - window.innerHeight, 1));
    update();
    window.addEventListener('resize', update);
    const id = setInterval(update, 1000); // content height can change as sections reveal
    return () => { window.removeEventListener('resize', update); clearInterval(id); };
  }, []);

  const go = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const pct = Math.min(y / max, 1);

  return (
    <div
      id="scrollTop"
      className={y > 400 ? 'show' : ''}
      role="button"
      tabIndex={0}
      aria-label="Scroll to top"
      onClick={go}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go())}
    >
      <svg viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={R} />
        <circle className="progress" cx="26" cy="26" r={R} style={{ strokeDasharray: C, strokeDashoffset: C - pct * C }} />
      </svg>
      <i className="bi bi-arrow-up" />
    </div>
  );
}
