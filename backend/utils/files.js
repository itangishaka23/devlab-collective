import fs from 'node:fs';
import path from 'node:path';
import env from '../config/env.js';

/** Public URL for a stored upload, or null. */
export const uploadUrl = (folder, file) => (file ? `${env.publicUrl}/uploads/${folder}/${encodeURIComponent(file)}` : null);

/** Delete a stored upload (ignores missing files; path-traversal safe). */
export const removeUpload = (folder, file) => {
  if (!file) return;
  const target = path.join(env.uploadDir, folder, path.basename(file));
  fs.promises.unlink(target).catch(() => {});
};
