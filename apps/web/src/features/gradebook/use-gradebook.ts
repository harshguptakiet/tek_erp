/**
 * Grade Book Hooks
 * React Query hooks for grade management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradebookService, type GradeEntry } from '../../services/gradebook.service';
import { toast } from 'sonner';

export function useClassGrades(classId: string, filters?: {
  subjectId?: string;
  examId?: string;
  termId?: string;
}) {
  return useQuery({
    queryKey: ['grades', 'class', classId, filters],
    queryFn: () => gradebookService.getClassGrades(classId, filters),
    enabled: !!classId,
  });
}

export function useStudentGrades(studentId: string, filters?: {
  subjectId?: string;
  termId?: string;
  academicYearId?: string;
}) {
  return useQuery({
    queryKey: ['grades', 'student', studentId, filters],
    queryFn: () => gradebookService.getStudentGrades(studentId, filters),
    enabled: !!studentId,
  });
}

export function useClassGradeBook(classId: string, filters?: {
  examId?: string;
  termId?: string;
}) {
  return useQuery({
    queryKey: ['gradebook', 'class', classId, filters],
    queryFn: () => gradebookService.getClassGradeBook(classId, filters),
    enabled: !!classId,
  });
}

export function useEnterGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grades: GradeEntry[]) => gradebookService.enterGrades(grades),
    onSuccess: (data) => {
      toast.success(`${data.count} grades entered successfully`);
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enter grades');
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gradeId, data }: { gradeId: string; data: Partial<GradeEntry> }) =>
      gradebookService.updateGrade(gradeId, data),
    onSuccess: () => {
      toast.success('Grade updated successfully');
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update grade');
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeId: string) => gradebookService.deleteGrade(gradeId),
    onSuccess: () => {
      toast.success('Grade deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete grade');
    },
  });
}

export function useCalculateRanks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, examId }: { classId: string; examId: string }) =>
      gradebookService.calculateRanks(classId, examId),
    onSuccess: () => {
      toast.success('Ranks calculated successfully');
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to calculate ranks');
    },
  });
}

export function useGradeStatistics(classId: string, filters?: {
  subjectId?: string;
  examId?: string;
}) {
  return useQuery({
    queryKey: ['grades', 'statistics', classId, filters],
    queryFn: () => gradebookService.getGradeStatistics(classId, filters),
    enabled: !!classId,
  });
}
