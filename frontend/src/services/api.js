import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  signup: (data) => api.post('/auth/signup', data),
};

// ── Checklists ──────────────────────────────
export const checklistApi = {
  list: (params) => api.get('/checklists', { params }),
  getById: (id) => api.get(`/checklists/${id}`),
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  remove: (id) => api.delete(`/checklists/${id}`),
  addItem: (checklistId, data) => api.post(`/checklists/${checklistId}/items`, data),
};

// ── Items ────────────────────────────────────
export const itemApi = {
  update: (id, data) => api.put(`/items/${id}`, data),
  remove: (id) => api.delete(`/items/${id}`),
  addRule: (id, data) => api.post(`/items/${id}/rules`, data),
};

// ── Executions ──────────────────────────────
export const executionApi = {
  start: (data) => api.post('/executions/start', data),
  answer: (id, data) => api.post(`/executions/${id}/answer`, data),
  finish: (id, data) => api.post(`/executions/${id}/finish`, data),
  list: (params) => api.get('/executions', { params }),
  getById: (id) => api.get(`/executions/${id}`),
};

// ── Dashboard ───────────────────────────────
export const dashboardApi = {
  overview: (params) => api.get('/dashboard', { params }),
  complianceHistory: (days) => api.get('/dashboard/compliance-history', { params: { days } }),
  failures: (limit) => api.get('/dashboard/failures', { params: { limit } }),
  userRanking: (limit) => api.get('/dashboard/user-ranking', { params: { limit } }),
};

// ── Gamification ────────────────────────────
export const gamificationApi = {
  ranking: (limit) => api.get('/gamification/ranking', { params: { limit } }),
  myScore: () => api.get('/gamification/me/score'),
};

// ── Alerts ──────────────────────────────────
export const alertApi = {
  list: () => api.get('/alerts'),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
};

export default api;
