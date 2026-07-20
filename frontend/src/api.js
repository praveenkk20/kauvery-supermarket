import axios from 'axios';
import store from './store/reduxStore';

const envBase = (import.meta.env.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');
const apiBase = import.meta.env.DEV ? '/api' : envBase;

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
