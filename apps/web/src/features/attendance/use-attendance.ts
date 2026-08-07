import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import { queryKeys } from '@/config/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function useAttendance(filters: any) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => attendanceService.getAttendance(filters),
  });
}

export function useAttendanceReport(filters: any) {
  return useQuery({
    queryKey: queryKeys.attendance.report(filters),
    queryFn: () => attendanceService.getAttendanceReport(filters),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => attendanceService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      addNotification({
        type: 'success',
        title: 'Attendance marked',
        message: 'Attendance has been recorded successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to mark attendance',
        message: error.message || 'Please try again',
      });
    },
  });
}
