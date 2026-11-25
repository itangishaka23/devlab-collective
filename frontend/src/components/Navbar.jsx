import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logoFull from '../assets/logo-full.png';
import logoFullDark from '../assets/logo-full-dark.png';
import { NAV_ITEMS } from '../data/site.js';
import useScrollY from '../hooks/useScrollY.js';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const SPY_IDS = NAV_ITEMS.filter((i) => i.hash).map((i) => i.hash);

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAdmin } = useAuth();
  const y = useScrollY();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => setOpen(false), [pathname]);

  // Scroll-spy for home-page sections
  useEffect(() => {
    if (pathname !== '/') return;
    const pos = y + 140;
    let current = 'home';
    SPY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) current = id;
    });
    setActive(current);
  }, [y, pathname]);

  return (
    <nav className={`navbar navbar-expand-lg navbar-hw ${y > 40 ? 'scrolled' : ''}`} id="mainNav">
      <div className="container">
        <Link className="hw-logo" to="/" aria-label="DevLab Collective — home">
          <img src={logoFull} alt="DevLab Collective" className="brand-img brand-light" />
          <img src={logoFullDark} alt="" aria-hidden="true" className="brand-img brand-dark" />
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'} fs-2`} />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="navMenu">
          <ul className="navbar-nav nav-hw mx-auto mt-3 mt-lg-0">
            {NAV_ITEMS.map((item) => (
              <li className="nav-item" key={item.label}>
                {item.to ? (
                  <NavLink className="nav-link" to={item.to}>{item.label}</NavLink>
                ) : (
                  <Link
                    className={`nav-link ${pathname === '/' && active === item.hash ? 'active' : ''}`}
                    to={{ pathname: '/', hash: `#${item.hash}` }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="nav-actions d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <ThemeToggle />
            {isAdmin && <Link to="/admin" className="nav-chip" title="Admin dashboard"><i className="bi bi-speedometer2" /> <span>Admin</span></Link>}
            {user ? (
              <Link to="/account" className="nav-chip" title="My account"><i className="bi bi-person-circle" /> <span>{user.name.split(' ')[0]}</span></Link>
            ) : (
              <Link to="/login" className="nav-chip"><i className="bi bi-box-arrow-in-right" /> <span>Log in</span></Link>
            )}
            <Link to="/join" className="btn-hw-primary nav-join">Join the Lab <i className="bi bi-arrow-right" /></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
