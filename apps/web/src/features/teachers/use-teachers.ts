import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/config/query-keys';
import { useUIStore } from '@/stores/ui.store';

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export function useTeachers(filters: TeacherFilters) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => userService.searchUsers(filters.search || '', {
      role: 'TEACHER',
      department: filters.department,
      status: filters.status,
      page: filters.page || 1,
      limit: filters.limit || 20,
    }),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => userService.getTeacherProfile(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => userService.createTeacherProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      addNotification({
        type: 'success',
        title: 'Teacher created',
        message: 'Teacher profile has been created successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create teacher',
        message: error.message || 'Please check the information and try again',
      });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userService.updateTeacherProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(variables.id) });
      addNotification({
        type: 'success',
        title: 'Teacher updated',
        message: 'Teacher profile has been updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to update teacher',
        message: error.message || 'Please try again',
      });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      addNotification({
        type: 'success',
        title: 'Teacher removed',
        message: 'Teacher has been removed from the system',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to delete teacher',
        message: error.message || 'Please try again',
      });
    },
  });
}
