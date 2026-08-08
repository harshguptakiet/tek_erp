/**
 * Parent Portal Hooks
 * React Query hooks for parent operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parentService } from '../../services/parent.service';
import { toast } from 'sonner';

export function useMyChildren() {
  return useQuery({
    queryKey: ['my-children'],
    queryFn: () => parentService.getMyChildren(),
  });
}

export function useChildAttendance(studentId: string, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['child-attendance', studentId, filters],
    queryFn: () => parentService.getChildAttendance(studentId, filters),
    enabled: !!studentId,
  });
}

export function useChildGrades(studentId: string, filters?: {
  termId?: string;
  academicYearId?: string;
}) {
  return useQuery({
    queryKey: ['child-grades', studentId, filters],
    queryFn: () => parentService.getChildGrades(studentId, filters),
    enabled: !!studentId,
  });
}

export function useChildFees(studentId: string) {
  return useQuery({
    queryKey: ['child-fees', studentId],
    queryFn: () => parentService.getChildFees(studentId),
    enabled: !!studentId,
  });
}

export function useChildTimetable(studentId: string) {
  return useQuery({
    queryKey: ['child-timetable', studentId],
    queryFn: () => parentService.getChildTimetable(studentId),
    enabled: !!studentId,
  });
}

export function useChildAssignments(studentId: string, filters?: {
  status?: string;
  subjectId?: string;
}) {
  return useQuery({
    queryKey: ['child-assignments', studentId, filters],
    queryFn: () => parentService.getChildAssignments(studentId, filters),
    enabled: !!studentId,
  });
}

export function useParentMessages(filters?: {
  childId?: string;
  isRead?: boolean;
}) {
  return useQuery({
    queryKey: ['parent-messages', filters],
    queryFn: () => parentService.getMessages(filters),
  });
}

export function useChildProfile(studentId: string) {
  return useQuery({
    queryKey: ['child-profile', studentId],
    queryFn: () => parentService.getChildProfile(studentId),
    enabled: !!studentId,
  });
}

export function useChildTeachers(studentId: string) {
  return useQuery({
    queryKey: ['child-teachers', studentId],
    queryFn: () => parentService.getChildTeachers(studentId),
    enabled: !!studentId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      toUserId: string;
      subject: string;
      message: string;
      childId?: string;
    }) => parentService.sendMessage(data),
    onSuccess: () => {
      toast.success('Message sent successfully');
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => parentService.markMessageAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
    },
  });
}
