// src/Api/axiosInstance.js
import axios from 'axios';
import { refreshToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const PUBLIC_401_OK = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/departments/public',
  '/auth/me',
];

const isPublicUrl = (url = '') => PUBLIC_401_OK.some((p) => url.includes(p));
const isOnPublicRoute = () => {
  const path = window.location?.pathname || '';
  return ['/login', '/register', '/verify-otp'].includes(path);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response) return Promise.reject(error); // network error

    const url = config?.url || '';
    const status = response.status;
    const skipAuthRedirect = Boolean(config?.skipAuthRedirect);

    // Debug: see which request caused the 401
    // (remove in prod if noisy)
    console.warn('[AXIOS 401]', { url, path: window.location.pathname });

    if (status !== 401) return Promise.reject(error);

    // NEVER redirect on public pages or for public endpoints
    if (skipAuthRedirect || isPublicUrl(url) || isOnPublicRoute()) {
      return Promise.reject(error);
    }

    // queue during refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
          axiosInstance(config).then(resolve).catch(reject);
        });
      });
    }

    // single retry per request
    if (config._retry) {
      // hard logout but DO NOT redirect if we already are on public route
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      axiosInstance.defaults.headers.common.Authorization = undefined;
      if (!isOnPublicRoute()) window.location.href = '/login';
      return Promise.reject(error);
    }
    config._retry = true;

    isRefreshing = true;
    try {
      const refreshRes = await refreshToken();
      if (refreshRes?.success && refreshRes?.accessToken) {
        const newToken = refreshRes.accessToken;
        localStorage.setItem('token', newToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        pendingRequests.forEach((cb) => cb(newToken));
        pendingRequests = [];

        config.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(config);
      }
      throw new Error('Refresh token failed');
    } catch (err) {
      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      axiosInstance.defaults.headers.common.Authorization = undefined;

      if (!isOnPublicRoute()) window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
