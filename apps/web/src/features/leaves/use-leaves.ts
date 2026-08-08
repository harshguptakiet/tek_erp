/**
 * Leave Management Hooks
 * React Query hooks for leave management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveService, type ApplyLeaveDto, type ApproveLeaveDto } from '../../services/leave.service';
import { toast } from 'sonner';

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getLeaveTypes(),
  });
}

export function useLeaveBalance(userId?: string) {
  return useQuery({
    queryKey: ['leave-balance', userId],
    queryFn: () => leaveService.getLeaveBalance(userId),
  });
}

export function useMyLeaves(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['my-leaves', filters],
    queryFn: () => leaveService.getMyLeaves(filters),
  });
}

export function useAllLeaves(filters?: {
  userId?: string;
  status?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['all-leaves', filters],
    queryFn: () => leaveService.getAllLeaves(filters),
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => leaveService.getPendingApprovals(),
  });
}

export function useLeaveDetails(leaveId: string) {
  return useQuery({
    queryKey: ['leave-details', leaveId],
    queryFn: () => leaveService.getLeaveDetails(leaveId),
    enabled: !!leaveId,
  });
}

export function useLeaveStatistics(filters?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['leave-statistics', filters],
    queryFn: () => leaveService.getLeaveStatistics(filters),
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyLeaveDto) => leaveService.applyLeave(data),
    onSuccess: () => {
      toast.success('Leave application submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, data }: { leaveId: string; data: Partial<ApplyLeaveDto> }) =>
      leaveService.updateLeave(leaveId, data),
    onSuccess: () => {
      toast.success('Leave application updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-details'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave');
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveId: string) => leaveService.cancelLeave(leaveId),
    onSuccess: () => {
      toast.success('Leave application cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    },
  });
}

export function useProcessLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, data }: { leaveId: string; data: ApproveLeaveDto }) =>
      leaveService.processLeave(leaveId, data),
    onSuccess: (_, variables) => {
      const action = variables.data.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Leave application ${action} successfully`);
      queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process leave');
    },
  });
}
