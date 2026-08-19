import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG, ROUTES } from '../config';
import { API_ENDPOINTS } from './httpEndpoint';
import store from '../store/store';
import { logout, loginSuccess } from '../store/slices/authSlice';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track in-flight refresh to avoid multiple concurrent refresh calls
let refreshPromise = null;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const locale = localStorage.getItem('locale') || 'en';
    config.headers['Accept-Language'] = locale;

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Retry on network errors or 5xx responses
    const attempt = originalRequest._retryCount ?? 0;
    const isRetryable = !error.response || error.response.status >= 500;
    if (isRetryable && attempt < API_CONFIG.RETRY_ATTEMPTS) {
      originalRequest._retryCount = attempt + 1;
      await sleep(API_CONFIG.RETRY_DELAY * originalRequest._retryCount);
      return axiosInstance(originalRequest);
    }

    // Token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Deduplicate: if another request already triggered refresh, wait for it
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          refreshPromise = axios
            .post(
              `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            )
            .then((res) => res.data)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshed = await refreshPromise;
        const newToken = refreshed.token ?? refreshed.accessToken;
        const user = refreshed.user ?? store.getState().auth.user;

        store.dispatch(loginSuccess({ token: newToken, user }));

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
        store.dispatch(logout());
        window.location.replace(ROUTES.LOGIN);
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      console.error('Access Forbidden:', error.response.data);
    }

    if (error.response?.status >= 500) {
      console.error('Server Error:', error.response.data);
    }

    if (!error.response) {
      console.error('Network Error:', error.message);
    }

    const message =
      error.response?.data?.message || error.message || 'An error occurred';

    if (message && !error.config?.suppressToast) {
      toast.error(message, { id: message });
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default axiosInstance;
