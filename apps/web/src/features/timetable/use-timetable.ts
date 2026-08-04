import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import type { Timetable, Period, CreateTimetableDto, UpdateTimetableDto, CreatePeriodDto, UpdatePeriodDto } from '@/types';

// Query Keys
export const timetableKeys = {
  all: ['timetables'] as const,
  lists: () => [...timetableKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...timetableKeys.lists(), filters] as const,
  details: () => [...timetableKeys.all, 'detail'] as const,
  detail: (id: string) => [...timetableKeys.details(), id] as const,
  byClass: (classId: string) => [...timetableKeys.all, 'class', classId] as const,
  byTeacher: (teacherId: string) => [...timetableKeys.all, 'teacher', teacherId] as const,
  periods: (timetableId: string) => [...timetableKeys.all, 'periods', timetableId] as const,
  conflicts: () => [...timetableKeys.all, 'conflicts'] as const,
};

// Fetch timetables list
export function useTimetables(filters?: Record<string, unknown>) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: timetableKeys.list(filters || {}),
    queryFn: () => academicService.getTimetables(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single timetable by ID
export function useTimetable(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: timetableKeys.detail(id),
    queryFn: () => academicService.getTimetableById(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch timetable by class
export function useTimetableByClass(classId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: timetableKeys.byClass(classId),
    queryFn: () => academicService.getTimetableByClass(classId),
    enabled: !!user?.schoolId && !!classId,
  });
}

// Fetch timetable by teacher
export function useTimetableByTeacher(teacherId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: timetableKeys.byTeacher(teacherId),
    queryFn: () => academicService.getTimetableByTeacher(teacherId),
    enabled: !!user?.schoolId && !!teacherId,
  });
}

// Fetch periods for a timetable
export function usePeriods(timetableId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: timetableKeys.periods(timetableId),
    queryFn: () => academicService.getTimetablePeriods(timetableId),
    enabled: !!user?.schoolId && !!timetableId,
  });
}

// Check for timetable conflicts
export function useTimetableConflicts(data: { classId: string; teacherId: string; dayOfWeek: number; startTime: string; endTime: string }) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...timetableKeys.conflicts(), data],
    queryFn: () => academicService.checkTimetableConflicts(data),
    enabled: !!user?.schoolId && !!data.classId && !!data.teacherId,
  });
}

// Create timetable mutation
export function useCreateTimetable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTimetableDto) => academicService.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create timetable: ${error.message}`);
    },
  });
}

// Update timetable mutation
export function useUpdateTimetable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimetableDto }) =>
      academicService.updateTimetable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update timetable: ${error.message}`);
    },
  });
}

// Delete timetable mutation
export function useDeleteTimetable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => academicService.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete timetable: ${error.message}`);
    },
  });
}

// Create period mutation
export function useCreatePeriod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ timetableId, data }: { timetableId: string; data: CreatePeriodDto }) =>
      academicService.createTimetablePeriod(timetableId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.periods(variables.timetableId) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success('Period added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add period: ${error.message}`);
    },
  });
}

// Update period mutation
export function useUpdatePeriod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ timetableId, periodId, data }: { timetableId: string; periodId: string; data: UpdatePeriodDto }) =>
      academicService.updateTimetablePeriod(timetableId, periodId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.periods(variables.timetableId) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success('Period updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update period: ${error.message}`);
    },
  });
}

// Delete period mutation
export function useDeletePeriod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ timetableId, periodId }: { timetableId: string; periodId: string }) =>
      academicService.deleteTimetablePeriod(timetableId, periodId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.periods(variables.timetableId) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success('Period deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete period: ${error.message}`);
    },
  });
}

// Bulk create periods mutation
export function useBulkCreatePeriods() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ timetableId, periods }: { timetableId: string; periods: CreatePeriodDto[] }) =>
      academicService.bulkCreatePeriods(timetableId, periods),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.periods(variables.timetableId) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(variables.timetableId) });
      toast.success(`${variables.periods.length} periods added successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add periods: ${error.message}`);
    },
  });
}

// Publish timetable mutation
export function usePublishTimetable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => academicService.publishTimetable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable published successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish timetable: ${error.message}`);
    },
  });
}

// Archive timetable mutation
export function useArchiveTimetable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => academicService.archiveTimetable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: timetableKeys.lists() });
      toast.success('Timetable archived successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive timetable: ${error.message}`);
    },
  });
}
