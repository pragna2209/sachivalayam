import axios from 'axios';
import useAuthStore from '../store/authStore';
import i18n from '../i18n';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 20000
});

// Attach the JWT access token and the current language (so the backend's
// Accept-Language fallback works correctly for unauthenticated calls too)
// to every outgoing request.
axiosClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['Accept-Language'] = i18n.language || 'en';
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

function resolveQueue(token) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// On a 401 response, attempt exactly one silent refresh-token retry before
// giving up and clearing the session. Concurrent requests that 401 while a
// refresh is already in flight queue behind that single refresh call
// rather than each independently hitting /auth/refresh-token.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config._retried) {
      return Promise.reject(error);
    }

    const { refreshToken, setAccessToken, clearSession } = useAuthStore.getState();
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) return reject(error);
          config._retried = true;
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosClient(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh-token`,
        { refreshToken }
      );
      const newAccessToken = data.data.accessToken;
      setAccessToken(newAccessToken);
      resolveQueue(newAccessToken);
      config._retried = true;
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(config);
    } catch (refreshError) {
      resolveQueue(null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
