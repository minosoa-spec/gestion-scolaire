import axios from 'axios';
import { API_URL } from '../config';
import {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  clearAuthData,
} from '../utils/authStorage';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}auth/refresh/`, { refresh });
          updateAccessToken(res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (e) {
          clearAuthData();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;