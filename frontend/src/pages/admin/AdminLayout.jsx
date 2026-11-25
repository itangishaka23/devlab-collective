import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const SECTIONS = [
  { title: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true }] },
  {
    title: 'Inbox',
    items: [
      { to: '/admin/applications', label: 'Applications', icon: 'bi-person-plus-fill' },
      { to: '/admin/messages', label: 'Messages', icon: 'bi-envelope-fill' },
      { to: '/admin/comments', label: 'Comments', icon: 'bi-chat-left-text-fill' },
      { to: '/admin/subscribers', label: 'Subscribers', icon: 'bi-megaphone-fill' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: 'bi-kanban-fill' },
      { to: '/admin/hosted', label: 'Hosted projects', icon: 'bi-cloud-check-fill' },
      { to: '/admin/posts', label: 'Blog posts', icon: 'bi-journal-richtext' },
      { to: '/admin/events', label: 'Events', icon: 'bi-calendar-event-fill' },
      { to: '/admin/faqs', label: 'FAQs', icon: 'bi-question-circle-fill' },
      { to: '/admin/team', label: 'Team', icon: 'bi-people-fill' },
      { to: '/admin/gallery', label: 'Gallery', icon: 'bi-images' },
      { to: '/admin/reports', label: 'Reports', icon: 'bi-file-earmark-pdf-fill' },
    ],
  },
  { title: 'People', items: [{ to: '/admin/members', label: 'Members', icon: 'bi-person-badge-fill' }] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <Seo title="Admin" description="DevLab Collective admin dashboard" />
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <Link to="/admin" className="admin-brand"><i className="bi bi-code-slash" /> DevLab <span>Admin</span></Link>
        <nav aria-label="Admin">
          {SECTIONS.map((s) => (
            <div key={s.title} className="admin-group">
              <div className="admin-group-title">{s.title}</div>
              {s.items.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} className="admin-link" onClick={() => setOpen(false)}>
                  <i className={`bi ${i.icon}`} /> {i.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="admin-top">
          <button type="button" className="admin-burger" aria-label="Open menu" onClick={() => setOpen(true)}><i className="bi bi-list" /></button>
          <div className="flex-grow-1" />
          <Link to="/" className="btn-hw-outline admin-btn"><i className="bi bi-box-arrow-up-right" /> View site</Link>
          <ThemeToggle />
          <span className="admin-user d-none d-md-inline"><i className="bi bi-person-circle" /> {user.name}</span>
          <button type="button" className="btn-hw-outline admin-btn" onClick={() => { logout(); navigate('/login'); }}><i className="bi bi-box-arrow-right" /> Log out</button>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
