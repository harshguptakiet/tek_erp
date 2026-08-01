import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, LoginDto, RegisterDto, ChangePasswordDto } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { queryKeys } from '../config/query-keys';

export function useAuth() {
  const router = useRouter();
  const { setUser, setAccessToken, logout: storeLogout } = useAuthStore();
  const { addNotification } = useUIStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `Logged in as ${data.user.firstName} ${data.user.lastName}`,
      });
      router.push('/dashboard');
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: 'Invalid email or password',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      addNotification({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to Tekurious ERP',
      });
      router.push('/dashboard');
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: 'Please check your information and try again',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storeLogout();
      addNotification({
        type: 'success',
        title: 'Logged out',
        message: 'See you next time!',
      });
      router.push('/auth/login');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Failed to change password',
        message: 'Please check your current password',
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
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every((p) => user.permissions.includes(p));
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
