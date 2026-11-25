import { Link } from 'react-router-dom';
import { adminStats } from '../../api/admin.js';
import useFetch from '../../hooks/useFetch.js';

const CARDS = [
  { key: 'pendingApplications', label: 'Applications to review', icon: 'bi-person-plus-fill', to: '/admin/applications', alert: true },
  { key: 'newMessages', label: 'New messages', icon: 'bi-envelope-fill', to: '/admin/messages', alert: true },
  { key: 'pendingComments', label: 'Comments to moderate', icon: 'bi-chat-left-text-fill', to: '/admin/comments', alert: true },
  { key: 'members', label: 'Members', icon: 'bi-person-badge-fill', to: '/admin/members' },
  { key: 'subscribers', label: 'Newsletter subscribers', icon: 'bi-megaphone-fill', to: '/admin/subscribers' },
  { key: 'registrations', label: 'Event registrations', icon: 'bi-ticket-perforated-fill', to: '/admin/events' },
  { key: 'hostedProjects', label: 'Hosted projects', icon: 'bi-cloud-check-fill', to: '/admin/hosted' },
  { key: 'projects', label: 'Projects', icon: 'bi-kanban-fill', to: '/admin/projects' },
  { key: 'posts', label: 'Blog posts', icon: 'bi-journal-richtext', to: '/admin/posts' },
  { key: 'events', label: 'Events', icon: 'bi-calendar-event-fill', to: '/admin/events' },
  { key: 'projectInterests', label: 'Project sign-ups', icon: 'bi-hand-index-thumb-fill', to: '/admin/projects' },
];

export default function Dashboard() {
  const { data, loading, error } = useFetch(adminStats, null, []);

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      <p className="text-muted">What needs your attention, and a snapshot of the lab.</p>
      {loading && <p className="text-muted" role="status">Loading…</p>}
      {error && <div className="alert alert-danger" role="alert">{error.message}</div>}
      {data && (
        <div className="row g-3">
          {CARDS.map((c) => {
            const n = data[c.key] ?? 0;
            return (
              <div className="col-6 col-md-4 col-xl-3" key={c.key}>
                <Link to={c.to} className={`stat-tile ${c.alert && n > 0 ? 'attention' : ''}`}>
                  <span className="st-icon"><i className={`bi ${c.icon}`} /></span>
                  <span className="st-num">{n}</span>
                  <span className="st-label">{c.label}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
