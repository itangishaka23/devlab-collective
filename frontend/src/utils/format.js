/** 'YYYY-MM-DD HH:MM:SS' (server, naive local time) → Date */
export const parseSqlDate = (s) => (s ? new Date(String(s).replace(' ', 'T')) : null);

export const formatEventDate = (s) =>
  parseSqlDate(s)?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) ?? '';

export const formatEventTime = (s) =>
  parseSqlDate(s)?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? '';

export const formatDateTime = (s) => (s ? `${formatEventDate(s)} · ${formatEventTime(s)}` : '');

/** Date value for <input type="datetime-local"> from a server datetime. */
export const toInputDateTime = (s) => (s ? String(s).slice(0, 16).replace(' ', 'T') : '');

/** Builds and downloads an .ics calendar file for an event. */
export function downloadIcs(ev) {
  const fmt = (s) => {
    const d = String(s).replace(/[-:\s]/g, '').slice(0, 14);
    return `${d.slice(0, 8)}T${d.slice(8, 14)}`;
  };
  const start = fmt(ev.starts_at);
  const end = fmt(ev.ends_at || ev.starts_at);
  const esc = (t) => String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DevLab Collective//Events//EN', 'BEGIN:VEVENT',
    `UID:event-${ev.id}@devlab-collective`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${esc(ev.title)}`, `LOCATION:${esc(ev.location)}`,
    `DESCRIPTION:${esc(ev.description)}`, 'END:VEVENT', 'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.replace(/[^\w-]+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
