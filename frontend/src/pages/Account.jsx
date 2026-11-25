import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, getMyEvents, getMyProjects, updateProfile } from '../api/services.js';
import Art from '../components/Art.jsx';
import Avatar from '../components/Avatar.jsx';
import Field, { inputClass } from '../components/Field.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { formatDateTime } from '../utils/format.js';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [values, setValues] = useState({ name: user.name, bio: user.bio || '', github: user.github || '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMsg({ type: '', text: '' });
    try {
      setUser(await updateProfile(values));
      setMsg({ type: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setMsg({ type: 'err', text: Object.keys(err.fieldErrors || {}).length ? '' : err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Full name" id="p-name" error={errors.name}>
        <input id="p-name" className={inputClass(errors.name)} value={values.name} onChange={set('name')} />
      </Field>
      <Field label="Email" id="p-email" hint="Your email is your login and can’t be changed here.">
        <input id="p-email" className="form-control form-control-hw" value={user.email} disabled />
      </Field>
      <Field label="GitHub username" id="p-gh" error={errors.github}>
        <input id="p-gh" className={inputClass(errors.github)} value={values.github} onChange={set('github')} placeholder="octocat" />
      </Field>
      <Field label="Short bio" id="p-bio" error={errors.bio}>
        <textarea id="p-bio" rows={3} maxLength={500} className={inputClass(errors.bio)} value={values.bio} onChange={set('bio')} />
      </Field>
      <div className="d-flex align-items-center gap-3">
        <button className="btn-hw-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        {msg.text && <span className={`small ${msg.type === 'ok' ? 'text-success' : 'text-danger'}`} role="status">{msg.text}</span>}
      </div>
    </form>
  );
}

function PasswordForm() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMsg({ type: '', text: '' });
    try {
      const res = await changePassword(values);
      setValues({ currentPassword: '', newPassword: '' });
      setMsg({ type: 'ok', text: res.message });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setMsg({ type: 'err', text: Object.keys(err.fieldErrors || {}).length ? '' : err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Current password" id="pw-cur" error={errors.currentPassword}>
        <input id="pw-cur" type="password" className={inputClass(errors.currentPassword)} value={values.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
      </Field>
      <Field label="New password" id="pw-new" error={errors.newPassword} hint="At least 8 characters, with a letter and a number.">
        <input id="pw-new" type="password" className={inputClass(errors.newPassword)} value={values.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
      </Field>
      <div className="d-flex align-items-center gap-3">
        <button className="btn-hw-outline" disabled={busy}>{busy ? 'Updating…' : 'Change password'}</button>
        {msg.text && <span className={`small ${msg.type === 'ok' ? 'text-success' : 'text-danger'}`} role="status">{msg.text}</span>}
      </div>
    </form>
  );
}

export default function Account() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const projects = useFetch(getMyProjects, [], []);
  const events = useFetch(getMyEvents, [], []);

  return (
    <section className="section-pad account-page">
      <Seo title="My account" description="Manage your DevLab Collective profile, projects and events." />
      <div className="container">
        <div className="account-head">
          <Avatar name={user.name} size={72} />
          <div className="flex-grow-1">
            <h1>{user.name}</h1>
            <p className="text-muted mb-0">{user.email} · {isAdmin ? 'Administrator' : 'Member'}</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {isAdmin && <Link to="/admin" className="btn-hw-primary"><i className="bi bi-speedometer2" /> Admin dashboard</Link>}
            <button type="button" className="btn-hw-outline" onClick={() => { logout(); navigate('/'); }}><i className="bi bi-box-arrow-right" /> Log out</button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="account-card">
              <h2><i className="bi bi-kanban-fill" /> My projects</h2>
              {projects.loading && <p className="text-muted" role="status">Loading…</p>}
              {!projects.loading && projects.data.length === 0 && (
                <p className="text-muted">You haven’t joined a project yet. <Link to="/#projects">Browse projects</Link>.</p>
              )}
              <ul className="mini-list">
                {projects.data.map((p) => (
                  <li key={p.id}>
                    <div className="mini-art"><Art icon={p.icon} variant={p.art} /></div>
                    <div className="flex-grow-1">
                      <Link to={`/projects/${p.slug}`}><strong>{p.title}</strong></Link>
                      <div className="small text-muted">{p.progress}% complete · {p.milestone}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="account-card">
              <h2><i className="bi bi-calendar-check-fill" /> My events</h2>
              {events.loading && <p className="text-muted" role="status">Loading…</p>}
              {!events.loading && events.data.length === 0 && <p className="text-muted">No registrations yet. <Link to="/events">See upcoming events</Link>.</p>}
              <ul className="mini-list">
                {events.data.map((ev) => (
                  <li key={ev.id}>
                    <span className="mini-icon"><i className={`bi ${ev.icon}`} /></span>
                    <div className="flex-grow-1">
                      <strong>{ev.title}</strong>
                      <div className="small text-muted">{formatDateTime(ev.starts_at)} · {ev.location}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="account-card"><h2><i className="bi bi-person-fill" /> Profile</h2><ProfileForm /></div>
            <div className="account-card"><h2><i className="bi bi-shield-lock-fill" /> Password</h2><PasswordForm /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
