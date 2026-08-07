import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { queryKeys } from '@/config/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function useClasses(schoolId: string) {
  return useQuery({
    queryKey: queryKeys.classes.list(schoolId),
    queryFn: () => academicService.getClassStructure(schoolId),
    enabled: !!schoolId,
  });
}

export function useClass(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: () => academicService.getClass(classId),
    enabled: !!classId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => academicService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      addNotification({
        type: 'success',
        title: 'Class created',
        message: 'Class has been created successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create class',
        message: error.message || 'Please try again',
      });
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => academicService.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      addNotification({
        type: 'success',
        title: 'Section created',
        message: 'Section has been added successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create section',
        message: error.message || 'Please try again',
      });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(variables.id) });
      addNotification({
        type: 'success',
        title: 'Class updated',
        message: 'Class has been updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to update class',
        message: error.message || 'Please try again',
      });
    },
  });
}
