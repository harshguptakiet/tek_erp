import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services';
import { toast } from 'sonner';

// Query keys
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters: any) => [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  submissions: (id: string) => [...assignmentKeys.detail(id), 'submissions'] as const,
  submission: (id: string) => [...assignmentKeys.all, 'submission', id] as const,
  rubric: (id: string) => [...assignmentKeys.detail(id), 'rubric'] as const,
  analytics: (id: string) => [...assignmentKeys.detail(id), 'analytics'] as const,
  homework: (filters: any) => [...assignmentKeys.all, 'homework', filters] as const,
  upcoming: (filters: any) => [...assignmentKeys.all, 'upcoming', filters] as const,
  overdue: (filters: any) => [...assignmentKeys.all, 'overdue', filters] as const,
};

// Queries
export function useAssignments(filters: any = {}) {
  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: () => assignmentService.listAssignments(filters),
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });
}

export function useAssignmentSubmissions(assignmentId: string, filters?: any) {
  return useQuery({
    queryKey: [...assignmentKeys.submissions(assignmentId), filters],
    queryFn: () => assignmentService.getSubmissions(assignmentId, filters),
    enabled: !!assignmentId,
  });
}

export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: assignmentKeys.submission(submissionId),
    queryFn: () => assignmentService.getSubmission(submissionId),
    enabled: !!submissionId,
  });
}

export function useStudentSubmission(assignmentId: string, studentId: string) {
  return useQuery({
    queryKey: [...assignmentKeys.submissions(assignmentId), studentId],
    queryFn: () => assignmentService.getStudentSubmission(assignmentId, studentId),
    enabled: !!assignmentId && !!studentId,
  });
}

export function useAssignmentRubric(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.rubric(assignmentId),
    queryFn: () => assignmentService.getRubric(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useAssignmentAnalytics(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.analytics(assignmentId),
    queryFn: () => assignmentService.getAssignmentAnalytics(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useHomework(studentId?: string, filters?: any) {
  return useQuery({
    queryKey: assignmentKeys.homework({ studentId, ...filters }),
    queryFn: () => assignmentService.getHomework(studentId, filters),
  });
}

export function useUpcomingAssignments(filters?: any) {
  return useQuery({
    queryKey: assignmentKeys.upcoming(filters),
    queryFn: () => assignmentService.getUpcomingAssignments(filters),
  });
}

export function useOverdueAssignments(filters?: any) {
  return useQuery({
    queryKey: assignmentKeys.overdue(filters),
    queryFn: () => assignmentService.getOverdueAssignments(filters),
  });
}

// Mutations
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => assignmentService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      toast.success('Assignment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      assignmentService.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      toast.success('Assignment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      toast.success('Assignment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    },
  });
}

export function usePublishAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentService.publishAssignment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(id) });
      toast.success('Assignment published successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish assignment');
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      assignmentService.submitAssignment(assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.submissions(variables.assignmentId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.homework({}) });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: any }) =>
      assignmentService.gradeSubmission(submissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.submission(variables.submissionId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Submission graded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    },
  });
}

export function useBulkGradeSubmissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, grades }: { assignmentId: string; grades: any[] }) =>
      assignmentService.bulkGradeSubmissions(assignmentId, grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Submissions graded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to grade submissions');
    },
  });
}

export function useCreateRubric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      assignmentService.createRubric(assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.rubric(variables.assignmentId) });
      toast.success('Rubric created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create rubric');
    },
  });
}

export function useCheckPlagiarism() {
  return useMutation({
    mutationFn: (submissionId: string) => assignmentService.checkPlagiarism(submissionId),
    onSuccess: () => {
      toast.success('Plagiarism check initiated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check plagiarism');
    },
  });
}

export function useAssignPeerReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      assignmentService.assignPeerReviews(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Peer reviews assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign peer reviews');
    },
  });
}

export function useSubmitPeerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: any }) =>
      assignmentService.submitPeerReview(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Peer review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit peer review');
    },
  });
}
