import { useEffect, useState } from 'react';

/** Current window scroll position (passive listener). */
export default function useScrollY() {
  const [y, setY] = useState(typeof window === 'undefined' ? 0 : window.scrollY);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}
