import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://e-commerce-4ch2.onrender.com/api';
const apiBaseUrl = configuredApiUrl.replace(/\/+$/, '').endsWith('/api')
  ? configuredApiUrl.replace(/\/+$/, '')
  : `${configuredApiUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('shopUser');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('shop-auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
