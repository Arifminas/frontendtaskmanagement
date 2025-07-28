import axios from 'axios';
import { refreshToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
console.log(import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if available
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token){ config.headers.Authorization = `Bearer ${token}`;}
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retry) {
  if (isRefreshing) {
    return new Promise(resolve => {
      pendingRequests.push(() => resolve(axiosInstance(config)));
    });
  }

  config._retry = true;
  isRefreshing = true;

  try {
    const refreshRes = await refreshToken();

    if (refreshRes.success && refreshRes.accessToken) {
      localStorage.setItem('token', refreshRes.accessToken);

      pendingRequests.forEach(cb => cb());
      pendingRequests = [];

      config.headers.Authorization = `Bearer ${refreshRes.accessToken}`;
      return axiosInstance(config);
    } else {
      throw new Error('Refresh token failed');
    }
  } catch (err) {
    pendingRequests = [];
    localStorage.removeItem('token');
    localStorage.removeItem('user');  // make sure key is 'user' consistent here
    window.location.href = '/login';
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}


    return Promise.reject(error);
  }
);

export default axiosInstance;
