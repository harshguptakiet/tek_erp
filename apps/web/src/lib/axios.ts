import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';
import { errorMapper } from './error-mapper';

// FR-AUTH-033: Access token stored in memory only (NOT localStorage)
// Refresh token is stored as HttpOnly cookie by the server
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  // FR-AUTH-033: Access tokens MUST NOT be stored in localStorage
  // They are kept in memory only for XSS protection
};

// No-op: refresh token is managed server-side as HttpOnly cookie
export const setRefreshToken = (_token: string | null) => {
  // Refresh tokens are stored as HttpOnly cookies by the server.
  // The client never stores them in JS-accessible storage.
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => null; // Managed by cookie

// Axios instance — always send credentials so HttpOnly cookie is included
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends HttpOnly refresh token cookie automatically
});

// Request interceptor — attach access token from memory
apiClient.interceptors.request.use(
  (reqConfig) => {
    if (accessToken && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — silent token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    // 401 on non-auth endpoint → try silent refresh via HttpOnly cookie
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }

        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        setAccessToken(newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        refreshPromise = null;

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      }
    }

    const appError = errorMapper(error);
    return Promise.reject(appError);
  }
);

// FR-AUTH-014: Refresh access token — sends HttpOnly cookie automatically via withCredentials
async function refreshAccessToken(): Promise<string> {
  try {
    // No body needed — refresh token is in the HttpOnly cookie
    const response = await axios.post(
      `${config.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const { accessToken: newAccessToken } = response.data;

    if (!newAccessToken) {
      throw new Error('No access token in refresh response');
    }

    setAccessToken(newAccessToken);
    // New refresh token cookie is set by server automatically

    return newAccessToken;
  } catch {
    throw new Error('Failed to refresh token');
  }
}
