import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/services/exam.service';

export function useGetExams(filters?: any) {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: () => examService.listExams(filters),
  });
}

export function useGetExam(id: string) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });
}

export function useGetExamAttempts(examId: string) {
  return useQuery({
    queryKey: ['exam-attempts', examId],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId,
  });
}

export function useGetExamRankings(examId: string) {
  return useQuery({
    queryKey: ['exam-rankings', examId],
    queryFn: () => examService.getExamRankings(examId),
    enabled: !!examId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useGradeExamAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: string; data: any }) =>
      examService.gradeAttempt(attemptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
    },
  });
}

// Alias for backward compatibility
export const useGradeAttempt = useGradeExamAttempt;
