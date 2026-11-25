export const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value; // MySQL JSON columns arrive already parsed
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const slugify = (text) =>
  String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const formatDate = (isoDate) =>
  new Date(`${String(isoDate).slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * Builds "col = ?, col2 = ?" for UPDATE statements from the whitelisted keys
 * that are present in `data`. JSON fields are stringified.
 */
export const buildUpdate = (data, allowed, jsonFields = []) => {
  const cols = [];
  const values = [];
  allowed.forEach((key) => {
    if (data[key] !== undefined) {
      cols.push(`${key} = ?`);
      values.push(jsonFields.includes(key) ? JSON.stringify(data[key]) : data[key]);
    }
  });
  return { setSql: cols.join(', '), values };
};

/** '2026-11-20T15:00' | '2026-11-20 15:00:00' → '2026-11-20 15:00:00' (or null when empty). */
export const toSqlDateTime = (value) => {
  if (!value) return null;
  const s = String(value).replace('T', ' ');
  return s.length === 16 ? `${s}:00` : s.slice(0, 19);
};

export const sizeLabel = (bytes, ext = 'PDF') => {
  if (!bytes) return ext;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB'} · ${ext}`;
};
