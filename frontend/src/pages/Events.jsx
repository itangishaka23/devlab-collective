import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getMyEvents } from '../api/services.js';
import EventCard from '../components/EventCard.jsx';
import EventRegisterModal from '../components/EventRegisterModal.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';

export default function Events() {
  const { user } = useAuth();
  const [tab, setTab] = useState('upcoming');
  const [registering, setRegistering] = useState(null);
  const [justRegistered, setJustRegistered] = useState([]);
  const [reload, setReload] = useState(0);

  const events = useFetch(() => getEvents(tab), [], [tab, reload]);
  const mine = useFetch(() => (user ? getMyEvents() : Promise.resolve([])), [], [user?.id, reload]);
  const registeredIds = new Set([...mine.data.map((e) => e.id), ...justRegistered]);

  return (
    <>
      <Seo title="Events" description="Workshops, hack nights and demo days at the DevLab Collective. Reserve your place." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative text-center">
          <span className="eyebrow"><i className="bi bi-calendar-event-fill" /> Events</span>
          <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)', maxWidth: 700 }}>Workshops, hack nights &amp; demo days</h1>
          <p className="hero-lead mt-3 mx-auto text-center">Learn alongside the lab. Everything here is free and beginners are welcome.</p>
        </Reveal>
      </header>

      <section className="section-pad pt-3">
        <div className="container">
          <div className="faq-cats mb-4" role="tablist" aria-label="Event filter">
            {[['upcoming', 'Upcoming', 'bi-calendar-plus'], ['past', 'Past events', 'bi-clock-history']].map(([id, label, icon]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={`faq-cat-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <i className={`bi ${icon}`} /> {label}
              </button>
            ))}
          </div>

          {events.loading && <p className="text-center text-muted" role="status">Loading events…</p>}
          {events.error && <div className="alert alert-warning text-center" role="alert">Events could not be loaded: {events.error.message}</div>}
          {!events.loading && !events.error && events.data.length === 0 && (
            <p className="text-center text-muted">{tab === 'upcoming' ? 'No upcoming events right now — check back soon.' : 'No past events yet.'}</p>
          )}

          <div className="event-list">
            {events.data.map((ev) => (
              <Reveal key={ev.id}>
                <EventCard event={ev} past={tab === 'past'} registered={registeredIds.has(ev.id)} onRegister={setRegistering} />
              </Reveal>
            ))}
          </div>

          {!user && tab === 'upcoming' && (
            <p className="text-center text-muted mt-4 small">Tip: <Link to="/register">create a member account</Link> to see your registrations in one place.</p>
          )}
        </div>
      </section>

      <EventRegisterModal
        event={registering}
        onClose={() => setRegistering(null)}
        onDone={(ev) => { if (ev) setJustRegistered((ids) => [...ids, ev.id]); setReload((n) => n + 1); }}
      />
    </>
  );
}
