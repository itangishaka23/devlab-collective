import axios from 'axios';

export const TOKEN_KEY = 'devlab_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach the login token (if any) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Normalise every failure into an Error with:
 *   message      — friendly text for the UI
 *   status       — HTTP status (undefined if the server was unreachable)
 *   fieldErrors  — { fieldName: 'message' } from validation (422) responses
 *   offline      — true when the API could not be reached at all
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;
    const err = new Error(
      res?.data?.message || (error.request ? 'Cannot reach the server. Please try again later.' : error.message)
    );
    err.status = res?.status;
    err.offline = !res;
    err.fieldErrors = {};
    (res?.data?.errors || []).forEach((e) => {
      if (e.field && !err.fieldErrors[e.field]) err.fieldErrors[e.field] = e.message;
    });

    // An expired / invalid token: sign the user out everywhere.
    if (res?.status === 401 && localStorage.getItem(TOKEN_KEY) && !error.config?.url?.startsWith('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('devlab:auth-expired'));
    }
    return Promise.reject(err);
  }
);

export default api;
