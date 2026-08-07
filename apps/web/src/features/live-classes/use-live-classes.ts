import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liveClassService } from '@/services/live-class.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const liveClassKeys = {
  all: ['liveClasses'] as const,
  lists: () => [...liveClassKeys.all, 'list'] as const,
  list: (filters: any) => [...liveClassKeys.lists(), filters] as const,
  details: () => [...liveClassKeys.all, 'detail'] as const,
  detail: (id: string) => [...liveClassKeys.details(), id] as const,
  upcoming: () => [...liveClassKeys.all, 'upcoming'] as const,
  active: () => [...liveClassKeys.all, 'active'] as const,
  recordings: (classId: string) => [...liveClassKeys.all, 'recordings', classId] as const,
  participants: (classId: string) => [...liveClassKeys.all, 'participants', classId] as const,
};

// Fetch live classes list
export function useLiveClasses(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.list(filters || {}),
    queryFn: () => liveClassService.listLiveClasses(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single live class
export function useLiveClass(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.detail(id),
    queryFn: () => liveClassService.getLiveClass(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch upcoming classes
export function useUpcomingClasses() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.upcoming(),
    queryFn: () => liveClassService.listLiveClasses({ status: 'SCHEDULED' }),
    enabled: !!user?.schoolId,
  });
}

// Fetch active/ongoing classes
export function useActiveClasses() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.active(),
    queryFn: () => liveClassService.listLiveClasses({ status: 'ONGOING' }),
    enabled: !!user?.schoolId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Fetch recordings for a class
export function useClassRecordings(classId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.recordings(classId),
    queryFn: () => liveClassService.getRecordings(classId),
    enabled: !!user?.schoolId && !!classId,
  });
}

// Fetch participants for a class
export function useClassParticipants(classId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: liveClassKeys.participants(classId),
    queryFn: () => liveClassService.getParticipants(classId),
    enabled: !!user?.schoolId && !!classId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
}

// Schedule live class mutation
export function useScheduleLiveClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => liveClassService.createLiveClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveClassKeys.lists() });
      queryClient.invalidateQueries({ queryKey: liveClassKeys.upcoming() });
      toast.success('Live class scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule class: ${error.message}`);
    },
  });
}

// Update live class mutation
export function useUpdateLiveClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      liveClassService.updateLiveClass(id, data),
    onSuccess: (_result: any, variables: { id: string; data: any }) => {
      queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: liveClassKeys.lists() });
      toast.success('Live class updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update class: ${error.message}`);
    },
  });
}

// Delete live class mutation
export function useDeleteLiveClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => liveClassService.deleteLiveClass(id),
    onSuccess: (_result: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: liveClassKeys.lists() });
      toast.success('Live class deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete class: ${error.message}`);
    },
  });
}

// End live class mutation
export function useEndLiveClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => liveClassService.endClass(id),
    onSuccess: (_result: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: liveClassKeys.active() });
      toast.success('Live class ended');
    },
    onError: (error: Error) => {
      toast.error(`Failed to end class: ${error.message}`);
    },
  });
}

// Join live class mutation
export function useJoinLiveClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => liveClassService.joinClass(id),
    onSuccess: (_result: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: liveClassKeys.participants(id) });
      toast.success('Joined live class');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join class: ${error.message}`);
    },
  });
}
