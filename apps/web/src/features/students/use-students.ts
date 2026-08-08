import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services';
import { toast } from 'sonner';

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: any) => [...studentKeys.lists(), { filters }] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  documents: (id: string) => [...studentKeys.detail(id), 'documents'] as const,
  health: (id: string) => [...studentKeys.detail(id), 'health'] as const,
  attendance: (id: string) => [...studentKeys.detail(id), 'attendance'] as const,
  performance: (id: string) => [...studentKeys.detail(id), 'performance'] as const,
};

// Queries
export function useStudents(filters: any = {}) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => studentService.getAll(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
}

export function useStudentDocuments(studentId: string) {
  return useQuery({
    queryKey: studentKeys.documents(studentId),
    queryFn: () => studentService.getDocuments(studentId),
    enabled: !!studentId,
  });
}

export function useStudentHealthRecords(studentId: string) {
  return useQuery({
    queryKey: studentKeys.health(studentId),
    queryFn: () => studentService.getHealthRecords(studentId),
    enabled: !!studentId,
  });
}

export function useStudentAttendance(studentId: string, filters?: any) {
  return useQuery({
    queryKey: [...studentKeys.attendance(studentId), filters],
    queryFn: () => studentService.getAttendanceSummary(studentId, filters),
    enabled: !!studentId,
  });
}

export function useStudentPerformance(studentId: string, filters?: any) {
  return useQuery({
    queryKey: [...studentKeys.performance(studentId), filters],
    queryFn: () => studentService.getPerformanceSummary(studentId, filters),
    enabled: !!studentId,
  });
}

export function useStudentGrades(studentId: string, academicYearId?: string) {
  return useQuery({
    queryKey: [...studentKeys.detail(studentId), 'grades', academicYearId],
    queryFn: () => studentService.getGrades(studentId, academicYearId),
    enabled: !!studentId,
  });
}

export function useGetEnrollmentHistory(studentId: string) {
  return useQuery({
    queryKey: [...studentKeys.detail(studentId), 'enrollments'],
    queryFn: () => studentService.getEnrollmentHistory(studentId),
    enabled: !!studentId,
  });
}

export function useFindByAdmissionNumber(admissionNumber: string) {
  return useQuery({
    queryKey: [...studentKeys.all, 'admission', admissionNumber],
    queryFn: () => studentService.findByAdmissionNumber(admissionNumber),
    enabled: !!admissionNumber && admissionNumber.length > 0,
  });
}

export function useBulkUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      studentIds, 
      classId, 
      sectionId 
    }: { 
      studentIds: string[]; 
      classId: string; 
      sectionId?: string;
    }) => studentService.bulkUpdateClass(studentIds, classId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Students moved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update class');
    },
  });
}

export function useBulkExport() {
  return useMutation({
    mutationFn: (filters: any) => studentService.bulkExport(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Students exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export students');
    },
  });
}

// Mutations
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => studentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create student');
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      studentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });
}

export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      studentService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useBulkImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => studentService.bulkImport(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(`Successfully imported ${data.success} students`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import students');
    },
  });
}

export function useUploadStudentDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, document }: { studentId: string; document: any }) =>
      studentService.uploadDocument(studentId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.documents(variables.studentId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });
}

export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, healthData }: { studentId: string; healthData: any }) =>
      studentService.updateHealthRecord(studentId, healthData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.health(variables.studentId) });
      toast.success('Health record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update health record');
    },
  });
}

export function useAddMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, record }: { studentId: string; record: any }) =>
      studentService.addMedicalRecord(studentId, record),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.health(variables.studentId) });
      toast.success('Medical record added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add medical record');
    },
  });
}

export function useGetParents(studentId: string) {
  return useQuery({
    queryKey: [...studentKeys.detail(studentId), 'parents'],
    queryFn: () => studentService.getParents(studentId),
    enabled: !!studentId,
  });
}

export function useLinkParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, parentData }: { studentId: string; parentData: any }) =>
      studentService.linkParent(studentId, parentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.studentId) });
      toast.success('Parent linked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to link parent');
    },
  });
}

export function useUnlinkParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, parentId }: { studentId: string; parentId: string }) =>
      studentService.unlinkParent(studentId, parentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.studentId) });
      toast.success('Parent unlinked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unlink parent');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, documentId }: { studentId: string; documentId: string }) =>
      studentService.deleteDocument(studentId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.documents(variables.studentId) });
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    },
  });
}

export function useTransferStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, transferData }: { studentId: string; transferData: any }) =>
      studentService.transferStudent(studentId, transferData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to transfer student');
    },
  });
}

export function useGraduateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, graduationData }: { studentId: string; graduationData: any }) =>
      studentService.graduateStudent(studentId, graduationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success('Student graduated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to graduate student');
    },
  });
}

export function useEnrollInClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, classId, sectionId, academicYearId }: { 
      studentId: string; 
      classId: string; 
      sectionId?: string;
      academicYearId?: string;
    }) => studentService.enrollInClass(studentId, classId, sectionId, academicYearId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.studentId) });
      toast.success('Student enrolled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enroll student');
    },
  });
}

export function useBulkPromote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, targetClassId }: { classId: string; targetClassId: string }) =>
      studentService.bulkPromote(classId, targetClassId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(`Successfully promoted ${data.promoted} students`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to promote students');
    },
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentIds: string[]) => studentService.bulkDelete(studentIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(`Successfully deleted ${data.deleted} students`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete students');
    },
  });
}

export function useGetAcademicHistory(studentId: string) {
  return useQuery({
    queryKey: [...studentKeys.detail(studentId), 'academicHistory'],
    queryFn: () => studentService.getAcademicHistory(studentId),
    enabled: !!studentId,
  });
}

export function useSearchStudents(query: string, filters?: any) {
  return useQuery({
    queryKey: [...studentKeys.lists(), 'search', query, filters],
    queryFn: () => studentService.search(query, filters),
    enabled: query.length > 0,
  });
}
