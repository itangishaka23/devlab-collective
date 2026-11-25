import { describe, expect, it } from 'vitest';
import { buildUpdate, formatDate, parseJson, sizeLabel, slugify, toSqlDateTime } from '../utils/helpers.js';

describe('helpers', () => {
  it('slugify makes URL-safe slugs', () => {
    expect(slugify('  Hello, World! 2026  ')).toBe('hello-world-2026');
    expect(slugify('CI/CD & Testing')).toBe('ci-cd-testing');
  });

  it('formatDate formats a YYYY-MM-DD string without timezone drift', () => {
    expect(formatDate('2026-10-28')).toBe('Oct 28, 2026');
    expect(formatDate('2026-01-01T00:00:00.000Z')).toBe('Jan 1, 2026');
  });

  it('parseJson parses strings, passes objects through and falls back on bad input', () => {
    expect(parseJson('["a","b"]', [])).toEqual(['a', 'b']);
    expect(parseJson(['x'], [])).toEqual(['x']);
    expect(parseJson('{oops', 'fallback')).toBe('fallback');
    expect(parseJson(null, [])).toEqual([]);
  });

  it('buildUpdate only includes whitelisted keys and stringifies JSON fields', () => {
    const { setSql, values } = buildUpdate({ title: 'T', stack: ['a'], evil: 'x' }, ['title', 'stack'], ['stack']);
    expect(setSql).toBe('title = ?, stack = ?');
    expect(values).toEqual(['T', '["a"]']);
  });

  it('toSqlDateTime normalises datetime-local values', () => {
    expect(toSqlDateTime('2026-11-20T15:00')).toBe('2026-11-20 15:00:00');
    expect(toSqlDateTime('2026-11-20 15:00:00')).toBe('2026-11-20 15:00:00');
    expect(toSqlDateTime('')).toBeNull();
  });

  it('sizeLabel formats file sizes', () => {
    expect(sizeLabel(0)).toBe('PDF');
    expect(sizeLabel(2.5 * 1024 * 1024)).toBe('2.5 MB · PDF');
    expect(sizeLabel(300 * 1024)).toBe('300 KB · PDF');
  });
});
