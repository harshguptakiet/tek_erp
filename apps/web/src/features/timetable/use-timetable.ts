import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '@/services';
import { toast } from 'sonner';

// Query keys
export const timetableKeys = {
  all: ['timetables'] as const,
  lists: () => [...timetableKeys.all, 'list'] as const,
  list: (filters: any) => [...timetableKeys.lists(), { filters }] as const,
  details: () => [...timetableKeys.all, 'detail'] as const,
  detail: (id: string) => [...timetableKeys.details(), id] as const,
  teacher: (teacherId: string) => [...timetableKeys.all, 'teacher', teacherId] as const,
  student: (studentId: string) => [...timetableKeys.all, 'student', studentId] as const,
  class: (classId: string) => [...timetableKeys.all, 'class', classId] as const,
  room: (roomId: string) => [...timetableKeys.all, 'room', roomId] as const,
  substitutions: (filters: any) => [...timetableKeys.all, 'substitutions', filters] as const,
  templates: (schoolId: string) => [...timetableKeys.all, 'templates', schoolId] as const,
};

// Queries
export function useTimetables(filters: any = {}) {
  return useQuery({
    queryKey: timetableKeys.list(filters),
    queryFn: () => timetableService.listTimetables(filters),
  });
}

export function useTimetable(id: string) {
  return useQuery({
    queryKey: timetableKeys.detail(id),
    queryFn: () => timetableService.getTimetable(id),
    enabled: !!id,
  });
}

export function useTeacherTimetable(teacherId: string, filters?: any) {
  return useQuery({
    queryKey: [...timetableKeys.teacher(teacherId), filters],
    queryFn: () => timetableService.getTeacherTimetable(teacherId, filters),
    enabled: !!teacherId,
  });
}

export function useStudentTimetable(studentId: string, filters?: any) {
  return useQuery({
    queryKey: [...timetableKeys.student(studentId), filters],
    queryFn: () => timetableService.getStudentTimetable(studentId, filters),
    enabled: !!studentId,
  });
}

export function useClassTimetable(classId: string, sectionId?: string, date?: string) {
  return useQuery({
    queryKey: [...timetableKeys.class(classId), { sectionId, date }],
    queryFn: () => timetableService.getClassTimetable(classId, sectionId, date),
    enabled: !!classId,
  });
}

export function useRoomSchedule(roomId: string, date?: string) {
  return useQuery({
    queryKey: [...timetableKeys.room(roomId), { date }],
    queryFn: () => timetableService.getRoomSchedule(roomId, date),
    enabled: !!roomId,
  });
}

export function useSubstitutions(filters?: any) {
  return useQuery({
    queryKey: timetableKeys.substitutions(filters),
    queryFn: () => timetableService.listSubstitutions(filters),
  });
}

export function useTimetableTemplates(schoolId: string) {
  return useQuery({
    queryKey: timetableKeys.templates(schoolId),
    queryFn: () => timetableService.listTemplates(schoolId),
    enabled: !!schoolId,
  });
}

// Mutations
export function useCreateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => timetableService.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create timetable');
    },
  });
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      timetableService.updateTimetable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update timetable');
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timetableService.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete timetable');
    },
  });
}

export function useCreatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ timetableId, data }: { timetableId: string; data: any }) =>
      timetableService.createPeriod(timetableId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success('Period created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create period');
    },
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodId, data }: { periodId: string; data: any }) =>
      timetableService.updatePeriod(periodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Period updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update period');
    },
  });
}

export function useDeletePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodId: string) => timetableService.deletePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Period deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete period');
    },
  });
}

export function useBulkCreatePeriods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ timetableId, periods }: { timetableId: string; periods: any[] }) =>
      timetableService.bulkCreatePeriods(timetableId, periods),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success('Periods created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create periods');
    },
  });
}

export function useValidateTimetable() {
  return useMutation({
    mutationFn: (timetableId: string) => timetableService.validateTimetable(timetableId),
    onSuccess: (data) => {
      if (data.conflicts?.length > 0) {
        toast.warning(`Found ${data.conflicts.length} conflicts`);
      } else {
        toast.success('Timetable is valid');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to validate timetable');
    },
  });
}

export function useCheckConflicts() {
  return useMutation({
    mutationFn: (data: any) => timetableService.checkConflicts(data),
  });
}

export function useCreateSubstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => timetableService.createSubstitution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Substitution created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create substitution');
    },
  });
}

export function useCancelSubstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (substitutionId: string) => timetableService.cancelSubstitution(substitutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Substitution cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel substitution');
    },
  });
}

export function useAutoGenerateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => timetableService.autoGenerateTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate timetable');
    },
  });
}

export function useSaveAsTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ timetableId, templateName }: { timetableId: string; templateName: string }) =>
      timetableService.saveAsTemplate(timetableId, templateName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Template saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save template');
    },
  });
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: any }) =>
      timetableService.applyTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Template applied successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply template');
    },
  });
}
