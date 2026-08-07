import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { queryKeys } from '@/config/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function useSubjects(filters: any) {
  return useQuery({
    queryKey: queryKeys.subjects.list(filters),
    queryFn: () => academicService.getSubjects(filters),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: queryKeys.subjects.detail(id),
    queryFn: () => academicService.getSubject(id),
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => academicService.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
      addNotification({
        type: 'success',
        title: 'Subject created',
        message: 'Subject has been created successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create subject',
        message: error.message || 'Please try again',
      });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateSubject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.detail(variables.id) });
      addNotification({
        type: 'success',
        title: 'Subject updated',
        message: 'Subject has been updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to update subject',
        message: error.message || 'Please try again',
      });
    },
  });
}
