import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liveClassService } from '@/services/live-class.service';

export function useGetLiveClasses(filters?: any) {
  return useQuery({
    queryKey: ['live-classes', filters],
    queryFn: () => liveClassService.listLiveClasses(filters),
  });
}

export function useGetLiveClass(id: string) {
  return useQuery({
    queryKey: ['live-class', id],
    queryFn: () => liveClassService.getLiveClass(id),
    enabled: !!id,
  });
}

export function useGetChatHistory(classId: string) {
  return useQuery({
    queryKey: ['live-class-chat', classId],
    queryFn: () => liveClassService.getChatHistory(classId),
    enabled: !!classId,
    refetchInterval: 5000,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, message }: { classId: string; message: string }) =>
      liveClassService.sendChatMessage(classId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['live-class-chat', variables.classId] });
    },
  });
}

export function useMuteParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, participantId }: { classId: string; participantId: string }) =>
      liveClassService.muteParticipant(classId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-class'] });
    },
  });
}

export function useUnmuteParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, participantId }: { classId: string; participantId: string }) =>
      liveClassService.unmuteParticipant(classId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-class'] });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, participantId }: { classId: string; participantId: string }) =>
      liveClassService.removeParticipant(classId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-class'] });
    },
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => liveClassService.createLiveClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-classes'] });
    },
  });
}

// Alias for backward compat
export const useLiveClass = useGetLiveClass;

export function useGetParticipants(classId: string) {
  return useQuery({
    queryKey: ['live-class-participants', classId],
    queryFn: () => liveClassService.getParticipants(classId),
    enabled: !!classId,
    refetchInterval: 10000,
  });
}

