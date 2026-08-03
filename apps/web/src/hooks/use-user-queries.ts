/**
 * User Management React Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

// Get current user profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });
}

// Get user by ID
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
}

// Search users
export function useSearchUsers(query: string, filters?: any) {
  return useQuery({
    queryKey: ['users', 'search', query, filters],
    queryFn: () => userService.searchUsers(query, filters),
    enabled: query.length >= 2,
  });
}

// Get user activity log
export function useUserActivity(userId?: string) {
  return useQuery({
    queryKey: ['user', userId, 'activity'],
    queryFn: () => userService.getActivityLog(userId ? { page: 1, limit: 100 } : undefined),
    select: (response) => response.data ?? [],
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}

// Upload profile picture mutation
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated');
    },
    onError: () => {
      toast.error('Failed to upload profile picture');
    },
  });
}

// Change email mutation
export function useChangeEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { newEmail: string; password: string }) => 
      userService.changeEmail(data.newEmail, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Verification email sent to your new email address');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change email');
    },
  });
}

// Change phone mutation
export function useChangePhone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { newPhone: string; password: string }) => 
      userService.changePhone(data.newPhone, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('OTP sent to your new phone number');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change phone');
    },
  });
}

// Deactivate account mutation
export function useDeactivateAccount() {
  return useMutation({
    mutationFn: (data: { password: string; reason: string }) => 
      userService.deactivateAccount(data.password, data.reason),
    onSuccess: () => {
      toast.success('Account deactivated. You can reactivate within 30 days.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate account');
    },
  });
}

// Delete account mutation
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (data: { password: string; confirmText: string }) =>
      userService.deleteAccount(data.password, data.confirmText),
    onSuccess: () => {
      toast.success('Account deleted permanently');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });
}

// Update privacy settings mutation
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: any) => userService.updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Privacy settings updated');
    },
    onError: () => {
      toast.error('Failed to update privacy settings');
    },
  });
}

// Request data export mutation
export function useRequestDataExport() {
  return useMutation({
    mutationFn: () => userService.requestDataExport(),
    onSuccess: () => {
      toast.success('Data export requested. You will receive an email when ready.');
    },
    onError: () => {
      toast.error('Failed to request data export');
    },
  });
}
