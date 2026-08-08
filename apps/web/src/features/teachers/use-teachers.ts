import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService, type Teacher, type TeacherFilters, type CreateTeacherDto } from '@/services';
import { toast } from 'sonner';

// Query keys
export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (filters: TeacherFilters) => [...teacherKeys.lists(), { filters }] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  subjects: (id: string) => [...teacherKeys.detail(id), 'subjects'] as const,
  classes: (id: string) => [...teacherKeys.detail(id), 'classes'] as const,
  timetable: (id: string) => [...teacherKeys.detail(id), 'timetable'] as const,
  performance: (id: string) => [...teacherKeys.detail(id), 'performance'] as const,
  attendance: (id: string) => [...teacherKeys.detail(id), 'attendance'] as const,
  documents: (id: string) => [...teacherKeys.detail(id), 'documents'] as const,
};

// Queries
export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: teacherKeys.list(filters),
    queryFn: () => teacherService.getAll(filters),
  });
}

export function useTeacher(id: string, include?: string[]) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teacherService.getById(id, include),
    enabled: !!id,
  });
}

export function useTeacherSubjects(teacherId: string) {
  return useQuery({
    queryKey: teacherKeys.subjects(teacherId),
    queryFn: () => teacherService.getTeacherSubjects(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: teacherKeys.classes(teacherId),
    queryFn: () => teacherService.getTeacherClasses(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherTimetable(teacherId: string, filters?: any) {
  return useQuery({
    queryKey: [...teacherKeys.timetable(teacherId), filters],
    queryFn: () => teacherService.getTeacherTimetable(teacherId, filters),
    enabled: !!teacherId,
  });
}

export function useTeacherPerformance(teacherId: string, filters?: any) {
  return useQuery({
    queryKey: [...teacherKeys.performance(teacherId), filters],
    queryFn: () => teacherService.getTeacherPerformance(teacherId, filters),
    enabled: !!teacherId,
  });
}

export function useTeacherAttendance(teacherId: string, filters?: any) {
  return useQuery({
    queryKey: [...teacherKeys.attendance(teacherId), filters],
    queryFn: () => teacherService.getTeacherAttendance(teacherId, filters),
    enabled: !!teacherId,
  });
}

export function useTeacherDocuments(teacherId: string) {
  return useQuery({
    queryKey: teacherKeys.documents(teacherId),
    queryFn: () => teacherService.getDocuments(teacherId),
    enabled: !!teacherId,
  });
}

export function useSearchTeachers(query: string, filters?: TeacherFilters) {
  return useQuery({
    queryKey: [...teacherKeys.lists(), 'search', query, filters],
    queryFn: () => teacherService.search(query, filters),
    enabled: query.length > 0,
  });
}

// Mutations
export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherDto) => teacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('Teacher created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create teacher');
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeacherDto> }) =>
      teacherService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('Teacher updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update teacher');
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teacherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    },
  });
}

export function useUpdateTeacherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      teacherService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('Teacher status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useAssignSubjectToTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, subjectId, classIds }: { teacherId: string; subjectId: string; classIds?: string[] }) =>
      teacherService.assignSubject(teacherId, subjectId, classIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.subjects(variables.teacherId) });
      toast.success('Subject assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign subject');
    },
  });
}

export function useUnassignSubjectFromTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, subjectId }: { teacherId: string; subjectId: string }) =>
      teacherService.unassignSubject(teacherId, subjectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.subjects(variables.teacherId) });
      toast.success('Subject unassigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unassign subject');
    },
  });
}

export function useAssignClassToTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, classId, role }: { teacherId: string; classId: string; role?: string }) =>
      teacherService.assignClass(teacherId, classId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.classes(variables.teacherId) });
      toast.success('Class assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign class');
    },
  });
}

export function useBulkImportTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => teacherService.bulkImport(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success(`Successfully imported ${data.success} teachers. ${data.failed} failed.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import teachers');
    },
  });
}

export function useUploadTeacherDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, document }: { teacherId: string; document: any }) =>
      teacherService.uploadDocument(teacherId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.documents(variables.teacherId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });
}
