import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feeService } from '@/services/fee.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const feeKeys = {
  all: ['fees'] as const,
  structures: () => [...feeKeys.all, 'structures'] as const,
  structure: (id: string) => [...feeKeys.structures(), id] as const,
  structuresByClass: (classId: string) => [...feeKeys.structures(), 'class', classId] as const,
  payments: () => [...feeKeys.all, 'payments'] as const,
  payment: (id: string) => [...feeKeys.payments(), id] as const,
  paymentsByStudent: (studentId: string) => [...feeKeys.payments(), 'student', studentId] as const,
  defaulters: () => [...feeKeys.all, 'defaulters'] as const,
  summary: (studentId: string) => [...feeKeys.all, 'summary', studentId] as const,
  receipts: (studentId: string) => [...feeKeys.all, 'receipts', studentId] as const,
};

// Fetch fee structures
export function useFeeStructures(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...feeKeys.structures(), filters],
    queryFn: () => feeService.listFeeStructures(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single fee structure
export function useFeeStructure(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: feeKeys.structure(id),
    queryFn: () => feeService.getFeeStructure(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch payments
export function useFeePayments(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...feeKeys.payments(), filters],
    queryFn: () => feeService.getPaymentHistory(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch fee details for student
export function useStudentFeeDetails(studentId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: feeKeys.summary(studentId),
    queryFn: () => feeService.getStudentFeeDetails(studentId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Fetch defaulters (due report)
export function useFeeDefaulters() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: feeKeys.defaulters(),
    queryFn: () => feeService.getDueReport(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });
}

// Fetch collection report
export function useFeeCollectionReport(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...feeKeys.all, 'collection', filters],
    queryFn: () => feeService.getCollectionReport(filters),
    enabled: !!user?.schoolId,
  });
}

// Create fee structure mutation
export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => feeService.createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.structures() });
      toast.success('Fee structure created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fee structure: ${error.message}`);
    },
  });
}

// Process payment mutation
export function useProcessPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => feeService.processPayment(data),
    onSuccess: (_result: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: feeKeys.payments() });
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: feeKeys.summary(variables.studentId) });
      }
      toast.success('Payment processed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to process payment: ${error.message}`);
    },
  });
}

// Generate receipt mutation
export function useGenerateReceipt() {
  return useMutation({
    mutationFn: (paymentId: string) => feeService.generateReceipt(paymentId),
    onSuccess: () => {
      toast.success('Receipt generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate receipt: ${error.message}`);
    },
  });
}

// Apply discount mutation
export function useApplyDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => feeService.applyDiscount(data),
    onSuccess: (_result: any, variables: any) => {
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: feeKeys.summary(variables.studentId) });
      }
      toast.success('Discount applied successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply discount: ${error.message}`);
    },
  });
}

// Process refund mutation
export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: any }) =>
      feeService.processRefund(paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.payments() });
      toast.success('Refund processed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to process refund: ${error.message}`);
    },
  });
}
