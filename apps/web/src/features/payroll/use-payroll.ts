import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/services/payroll.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const payrollKeys = {
  all: ['payroll'] as const,
  records: () => [...payrollKeys.all, 'records'] as const,
  record: (id: string) => [...payrollKeys.records(), id] as const,
  summary: (month: number, year: number) => [...payrollKeys.all, 'summary', month, year] as const,
};

// Fetch payroll records
export function usePayrollRecords(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...payrollKeys.records(), filters],
    queryFn: () => payrollService.listPayrollRecords({ ...filters, schoolId: user?.schoolId }),
    enabled: !!user?.schoolId,
  });
}

// Fetch single payroll record
export function usePayrollRecord(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: payrollKeys.record(id),
    queryFn: () => payrollService.getPayrollRecord(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch payroll summary
export function usePayrollSummary(month: number, year: number) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: payrollKeys.summary(month, year),
    queryFn: () => payrollService.getPayrollSummary({ month, year, schoolId: user?.schoolId! }),
    enabled: !!user?.schoolId,
  });
}

// Create payroll record mutation
export function useCreatePayrollRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => payrollService.createPayrollRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.records() });
      toast.success('Payroll record created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payroll record: ${error.message}`);
    },
  });
}

// Update payroll record mutation
export function useUpdatePayrollRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      payrollService.updatePayrollRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.record(variables.id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.records() });
      toast.success('Payroll record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payroll record: ${error.message}`);
    },
  });
}

// Process payroll mutation
export function useProcessPayroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => payrollService.processPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.record(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.records() });
      toast.success('Payroll processed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to process payroll: ${error.message}`);
    },
  });
}

// Mark as paid mutation
export function useMarkPayrollAsPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paidDate: string; paymentMethod: string } }) =>
      payrollService.markAsPaid(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.record(variables.id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.records() });
      toast.success('Payroll marked as paid');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as paid: ${error.message}`);
    },
  });
}

// Bulk process payroll mutation
export function useBulkProcessPayroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recordIds: string[]) => payrollService.bulkProcessPayroll(recordIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.records() });
      toast.success('Payroll records processed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to bulk process payroll: ${error.message}`);
    },
  });
}
