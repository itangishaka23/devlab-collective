import { downloadIcs, formatEventTime, parseSqlDate } from '../utils/format.js';

export default function EventCard({ event, past = false, registered = false, onRegister }) {
  const d = parseSqlDate(event.starts_at);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const pct = event.capacity ? Math.min(Math.round((event.registered / event.capacity) * 100), 100) : 0;

  return (
    <article className={`event-card ${past ? 'is-past' : ''}`}>
      <div className="event-date" aria-hidden="true">
        <span className="m">{month}</span>
        <span className="d">{day}</span>
      </div>
      <div className="event-main">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="event-type"><i className={`bi ${event.icon}`} /> {event.type}</span>
          {event.isFull && !past && <span className="event-badge full">Full</span>}
          {registered && <span className="event-badge ok"><i className="bi bi-check2" /> Registered</span>}
        </div>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description}</p>
        <ul className="event-meta">
          <li><i className="bi bi-clock" /> {formatEventTime(event.starts_at)}{event.ends_at ? ` – ${formatEventTime(event.ends_at)}` : ''}</li>
          <li><i className="bi bi-geo-alt" /> {event.location}</li>
          {event.capacity > 0 && <li><i className="bi bi-people" /> {past ? `${event.registered} attended` : `${event.spotsLeft} of ${event.capacity} spots left`}</li>}
        </ul>
        {event.capacity > 0 && !past && (
          <div className="event-cap" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        )}
      </div>
      {!past && (
        <div className="event-actions">
          <button type="button" className="btn-hw-primary" disabled={event.isFull || registered} onClick={() => onRegister(event)}>
            {registered ? 'You’re in' : event.isFull ? 'Full' : 'Register'}
          </button>
          <button type="button" className="btn-hw-outline" onClick={() => downloadIcs(event)} title="Download calendar file (.ics)">
            <i className="bi bi-calendar-plus" /> Add to calendar
          </button>
        </div>
      )}
    </article>
  );
}
