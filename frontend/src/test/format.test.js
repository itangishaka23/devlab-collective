import { describe, expect, it } from 'vitest';
import { formatEventTime, parseSqlDate, toInputDateTime } from '../utils/format.js';

describe('date helpers', () => {
  it('parses server datetimes as local time', () => {
    const d = parseSqlDate('2026-12-05 14:30:00');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 11, 5, 14, 30]);
  });

  it('formats a time of day', () => {
    expect(formatEventTime('2026-12-05 14:30:00')).toMatch(/2:30\s?PM/i);
  });

  it('builds datetime-local input values', () => {
    expect(toInputDateTime('2026-12-05 14:30:00')).toBe('2026-12-05T14:30');
    expect(toInputDateTime(null)).toBe('');
  });
});
