import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView.js';

/** Counts up to `target` when scrolled into view. */
export default function Counter({ target, duration = 1800 }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}
