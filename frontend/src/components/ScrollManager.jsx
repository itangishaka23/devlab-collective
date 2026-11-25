import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on route change, or to the #hash target if present. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      return undefined;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 10) timer = setTimeout(tick, 60);
    };
    let timer = setTimeout(tick, 30);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
