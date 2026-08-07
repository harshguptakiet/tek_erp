import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment.service';
import { queryKeys } from '@/config/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function useAssignments(filters: any) {
  return useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: () => assignmentService.getAssignments(filters),
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => assignmentService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      addNotification({
        type: 'success',
        title: 'Assignment created',
        message: 'Assignment has been created successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create assignment',
        message: error.message || 'Please try again',
      });
    },
  });
}

export function useGradeAssignment() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ assignmentId, grades }: { assignmentId: string; grades: any }) =>
      assignmentService.gradeAssignment(assignmentId, grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      addNotification({
        type: 'success',
        title: 'Grades submitted',
        message: 'Assignment grades have been submitted successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to submit grades',
        message: error.message || 'Please try again',
      });
    },
  });
}
