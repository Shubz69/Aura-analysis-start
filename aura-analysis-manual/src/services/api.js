import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Use the same token key as the main Aura FX platform (set REACT_APP_AUTH_TOKEN_KEY if different).
const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'token';

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const msg = data?.message || data?.error || err.message || 'Request failed';
    const e = new Error(msg);
    e.response = err.response;
    return Promise.reject(e);
  }
);

export async function getMe() {
  const { data } = await api.get('/api/aura-analysis/me');
  return data;
}

export async function getAssets() {
  const { data } = await api.get('/api/aura-analysis/assets');
  return data;
}

export async function getTrades(params = {}) {
  const { data } = await api.get('/api/aura-analysis/trades', { params });
  return data;
}

export async function getTrade(id) {
  const { data } = await api.get(`/api/aura-analysis/trades/${id}`);
  return data;
}

export async function createTrade(payload) {
  const { data } = await api.post('/api/aura-analysis/trades', payload);
  return data;
}

export async function updateTrade(id, payload) {
  const { data } = await api.put(`/api/aura-analysis/trades/${id}`, payload);
  return data;
}

export async function deleteTrade(id) {
  await api.delete(`/api/aura-analysis/trades/${id}`);
}

export async function getAnalyticsOverview() {
  const { data } = await api.get('/api/aura-analysis/analytics/overview');
  return data;
}

export async function getAnalyticsPerformance() {
  const { data } = await api.get('/api/aura-analysis/analytics/performance');
  return data;
}

export async function getLeaderboard(params = {}) {
  const { data } = await api.get('/api/aura-analysis/analytics/leaderboard', { params });
  return data;
}

export async function getChecklists() {
  const { data } = await api.get('/api/aura-analysis/checklists');
  return data;
}

export async function getAdminOverview() {
  const { data } = await api.get('/api/aura-analysis/admin/overview');
  return data;
}

export async function getAdminTrades(params = {}) {
  const { data } = await api.get('/api/aura-analysis/admin/trades', { params });
  return data;
}

export default api;
