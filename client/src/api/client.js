import axios from 'axios';
import { storage } from '../utils/storage';

const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = storage.get('lc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && storage.get('lc_token')) {
      storage.remove('lc_token');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login?expired=1';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

/** Download a protected file using the auth token. */
export async function downloadFile(url, filename) {
  const res = await api.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export default api;
