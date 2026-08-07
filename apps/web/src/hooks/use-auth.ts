import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, type LoginDto, type RegisterDto, type ChangePasswordDto } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { queryKeys } from '../config/query-keys';

export function useAuth() {
  const router = useRouter();
  const { setUser, setTokens, logout: storeLogout } = useAuthStore();
  const { addNotification } = useUIStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user as any);
      setTokens({ accessToken: data.accessToken, refreshToken: '' });
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `Logged in as ${data.user.firstName} ${data.user.lastName}`,
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: error.response?.data?.message || error.message || 'Invalid email or password',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (data) => {
      setUser(data.user as any);
      setTokens({ accessToken: data.accessToken, refreshToken: '' });
      
      addNotification({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to Tekurious ERP',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: error.response?.data?.message || 'Please check your information and try again',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      
      addNotification({
        type: 'success',
        title: 'Logged out',
        message: 'See you next time!',
      });
      router.push('/auth/login');
    },
    onError: () => {
      // Even if server logout fails, clear local state
      storeLogout();
      router.push('/auth/login');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => authService.changePassword(data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to change password',
        message: error.response?.data?.message || 'Please check your current password',
      });
    },
  });

  return {
    // Mutations
    login: (data: LoginDto) => loginMutation.mutate(data),
    register: (data: RegisterDto) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    changePassword: (data: ChangePasswordDto) => changePasswordMutation.mutate(data),

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

// Hook to check permissions
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some((p) => user.permissions?.includes(p) ?? false);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every((p) => user.permissions?.includes(p) ?? false);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    permissions: user?.permissions || [],
    role: user?.role,
  };
}
