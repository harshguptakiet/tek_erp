import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService, type StudentFilters, type CreateStudentDto, type UpdateStudentDto } from '../../services/student.service';
import { queryKeys } from '../../config/query-keys';
import { useUIStore } from '../../stores/ui.store';

export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => studentService.getAll(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateStudentDto) => studentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      addNotification({
        type: 'success',
        title: 'Student created',
        message: 'Student has been created successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Failed to create student',
        message: 'Please check the information and try again',
      });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentDto }) =>
      studentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.id) });
      addNotification({
        type: 'success',
        title: 'Student updated',
        message: 'Student information has been updated',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Failed to update student',
        message: 'Please try again',
      });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      addNotification({
        type: 'success',
        title: 'Student deleted',
        message: 'Student has been removed from the system',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Failed to delete student',
        message: 'Please try again',
      });
    },
  });
}
