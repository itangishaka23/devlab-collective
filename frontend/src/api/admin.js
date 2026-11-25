import api from './client.js';

/** Plain object → FormData (Files appended as files, objects as JSON). */
export function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof File) fd.append(k, v);
    else fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  });
  return fd;
}

export const adminGet = (path) => api.get(path).then((r) => r.data.data);
export const adminStats = () => adminGet('/admin/stats');

/** method: 'post' | 'put' | 'patch' | 'delete' */
export const adminSend = (method, path, payload, multipart = false) =>
  api.request({ method, url: path, data: multipart ? toFormData(payload) : payload }).then((r) => r.data);
