import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/services/exam.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';

// ==================== QUERY HOOKS ====================

export const useExams = (filters?: {
  sectionId?: string;
  subjectId?: string;
  examType?: string;
  academicYearId?: string;
}) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['exams', filters, user?.schoolId],
    queryFn: () => examService.listExams(filters),
    enabled: !!user?.schoolId,
  });
};

export const useExam = (id: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });
};

export const useExamResults = (examId: string) => {
  return useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => examService.getExamResults(examId),
    enabled: !!examId,
  });
};

export const useStudentResult = (examId: string, studentId: string) => {
  return useQuery({
    queryKey: ['student-result', examId, studentId],
    queryFn: () => examService.getStudentResult(examId, studentId),
    enabled: !!examId && !!studentId,
  });
};

export const useReportCards = (filters?: {
  studentId?: string;
  academicYearId?: string;
}) => {
  return useQuery({
    queryKey: ['report-cards', filters],
    queryFn: () => examService.listReportCards(filters),
  });
};

export const useReportCard = (id: string) => {
  return useQuery({
    queryKey: ['report-card', id],
    queryFn: () => examService.getReportCard(id),
    enabled: !!id,
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      examType: string;
      subjectId: string;
      sectionId: string;
      date: string;
      duration: number;
      totalMarks: number;
      passingMarks: number;
    }) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      examService.updateExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      toast.success('Exam updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    },
  });
};

export const useSubmitGrades = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      grades,
    }: {
      examId: string;
      grades: Array<{
        studentId: string;
        marksObtained: number;
        grade?: string;
        remarks?: string;
      }>;
    }) => examService.submitGrades(examId, grades),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.examId] });
      toast.success('Grades submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit grades');
    },
  });
};

export const usePublishResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => examService.publishResults(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      toast.success('Results published successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish results');
    },
  });
};

export const useGenerateReportCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, academicYearId }: {
      studentId: string;
      academicYearId: string;
    }) => examService.generateReportCard(studentId, academicYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-cards'] });
      toast.success('Report card generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report card');
    },
  });
};
