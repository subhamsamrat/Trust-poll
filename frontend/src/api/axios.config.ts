import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BaseUrl = import.meta.env.VITE_BASE_URL;

const axiosClient = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Error attaching auth token to request:', e);
    }
  }
  return config;
});

// Manage concurrency for token refresh
let isRefreshing = false;
let failedQueue: Array<{  resolve: (value: any) => void;
  reject: (error: any) => void;}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
        console.log("!! Original Request=",originalRequest);
        
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Check if the error is 401 Unauthorized / Token expired
    // Avoid intercepting auth endpoints like /auth/login, /auth/register, /auth/refresh-token
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // If a refresh is already in flight, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(axiosClient(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh-token endpoint directly to avoid interceptor recursion
        const response = await axios.post(
          `${BaseUrl}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          response.data?.data?.accessToken || response.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('New access token not found in refresh response');
        }

        // Update localStorage
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.accessToken = newAccessToken;
              localStorage.setItem('currentUser', JSON.stringify(parsed));
            }
          } catch (e) {
            console.error('Error updating currentUser in localStorage:', e);
          }
        }

        // Update default Authorization header for future requests
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Update header for current retried request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Release queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed (e.g. expired or invalid)
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
          // Only redirect if not already on login/signup page
          if (
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/signup')
          ) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
