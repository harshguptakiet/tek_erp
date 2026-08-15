import { create } from 'zustand';
import { setAccessToken } from '../lib/axios';

// User type based on your backend JWT payload
export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  organizationId?: string;
  schoolId?: string;
  tenantId?: string;
  profilePicture?: string;
  status: string;
  twoFactorEnabled?: boolean;
  lastLogin?: Date | string;
  isSuperAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setAccessToken: (token) => {
    setAccessToken(token);
  },

  setTokens: (tokens) => {
    setAccessToken(tokens.accessToken);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
    }
  },

  logout: () => {
    setAccessToken(null);
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  },

  clearAuth: () => {
    setAccessToken(null);
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

// Selectors for optimized re-renders
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectUserPermissions = (state: AuthState) => state.user?.permissions || [];
