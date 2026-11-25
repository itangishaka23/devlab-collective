import api from './client.js';

// Each function resolves with the useful payload (response.data.data / full body).
const data = (p) => p.then((r) => r.data.data);
const body = (p) => p.then((r) => r.data);

// ---- auth & account ----
export const registerUser = (payload) => data(api.post('/auth/register', payload));
export const loginUser = (payload) => data(api.post('/auth/login', payload));
export const getMe = () => data(api.get('/auth/me'));
export const updateProfile = (payload) => data(api.put('/me/profile', payload));
export const changePassword = (payload) => body(api.put('/me/password', payload));
export const getMyProjects = () => data(api.get('/me/projects'));
export const getMyEvents = () => data(api.get('/me/events'));

// ---- projects ----
export const getProjects = () => data(api.get('/projects'));
export const getProject = (ref) => data(api.get(`/projects/${encodeURIComponent(ref)}`));
export const getProjectGithub = (ref) => data(api.get(`/projects/${encodeURIComponent(ref)}/github`));
export const joinProject = (id, payload) => body(api.post(`/projects/${id}/interest`, payload));

// ---- blog ----
/** Returns { items, meta } for a page of posts. */
export const getPosts = (params = {}) =>
  api.get('/posts', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta }));
export const getPost = (slug) => data(api.get(`/posts/${encodeURIComponent(slug)}`));
export const getComments = (slug) => data(api.get(`/posts/${encodeURIComponent(slug)}/comments`));
export const addComment = (slug, text) => body(api.post(`/posts/${encodeURIComponent(slug)}/comments`, { body: text }));
export const getReactions = (slug) => data(api.get(`/posts/${encodeURIComponent(slug)}/reactions`));
export const toggleReaction = (slug, type) => data(api.post(`/posts/${encodeURIComponent(slug)}/reactions`, { type }));

// ---- other public content ----
export const getFaqs = () => data(api.get('/faqs'));
export const getEvents = (scope = 'all') => data(api.get('/events', { params: { scope } }));
export const registerForEvent = (id, payload) => body(api.post(`/events/${id}/register`, payload));
export const getTeam = () => data(api.get('/team'));
export const getHostedProjects = (limit) => data(api.get('/hosted-projects', { params: limit ? { limit } : {} }));
export const getGallery = () => data(api.get('/gallery'));
export const getReports = () => data(api.get('/reports'));
export const reportDownloadUrl = (id) => `${api.defaults.baseURL}/reports/${id}/download`;

// ---- forms ----
export const sendContact = (payload) => body(api.post('/contact', payload));
export const subscribe = (email, source = 'website', extra = {}) => body(api.post('/subscribers', { email, source, ...extra }));
export const submitApplication = (payload) => body(api.post('/applications', payload));
