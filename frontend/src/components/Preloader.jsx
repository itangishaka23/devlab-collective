import { useEffect, useState } from 'react';
import logoIcon from '../assets/logo-icon.png';

export default function Preloader() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 700);
    const t2 = setTimeout(() => setGone(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;
  return (
    <div id="preloader" className={hide ? 'hide' : ''} aria-hidden="true">
      <div className="preload-ring">
        <img src={logoIcon} alt="" className="preload-logo" />
      </div>
      <div className="preload-text">COMPILING&hellip;</div>
    </div>
  );
}
