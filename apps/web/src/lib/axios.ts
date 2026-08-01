import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';
import { errorMapper } from './error-mapper';

// Token management
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Axios instance
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Sends HttpOnly cookies
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use existing refresh promise or create new one
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }

        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        // Update token and retry request
        setAccessToken(newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        setAccessToken(null);
        refreshPromise = null;

        // Trigger logout (handled by auth store)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Map error to user-friendly format
    const appError = errorMapper(error);
    return Promise.reject(appError);
  }
);

// Refresh access token using HttpOnly refresh cookie
async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${config.apiUrl}/auth/refresh`,
      {},
      {
        withCredentials: true, // Sends HttpOnly refresh cookie
      }
    );

    return response.data.accessToken;
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
}
