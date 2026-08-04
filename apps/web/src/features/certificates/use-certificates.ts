import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '@/services/certificate.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (filters: any) => [...certificateKeys.lists(), filters] as const,
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateKeys.details(), id] as const,
  byStudent: (studentId: string) => [...certificateKeys.all, 'student', studentId] as const,
  templates: () => [...certificateKeys.all, 'templates'] as const,
};

// Fetch certificates list
export function useCertificates(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: certificateKeys.list(filters || {}),
    queryFn: () => certificateService.listCertificates(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single certificate
export function useCertificate(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => certificateService.getCertificate(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch certificates by student
export function useStudentCertificates(studentId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: certificateKeys.byStudent(studentId),
    queryFn: () => certificateService.getStudentCertificates(studentId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Fetch certificate templates
export function useCertificateTemplates() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: certificateKeys.templates(),
    queryFn: () => certificateService.getTemplates(),
    enabled: !!user?.schoolId,
  });
}

// Generate certificate mutation
export function useGenerateCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => certificateService.generateCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
      toast.success('Certificate generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
    },
  });
}

// Generate ID card mutation
export function useGenerateIdCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => certificateService.generateIdCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
      toast.success('ID card generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate ID card: ${error.message}`);
    },
  });
}

// Verify certificate mutation
export function useVerifyCertificate() {
  return useMutation({
    mutationFn: (certificateNumber: string) => certificateService.verifyCertificate(certificateNumber),
    onSuccess: (data) => {
      if (data.isValid) {
        toast.success('Certificate is valid');
      } else {
        toast.error('Certificate is invalid or has been revoked');
      }
    },
    onError: (error: Error) => {
      toast.error(`Verification failed: ${error.message}`);
    },
  });
}

// Download certificate mutation
export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (id: string) => certificateService.downloadCertificate(id),
    onSuccess: () => {
      toast.success('Download started');
    },
    onError: (error: Error) => {
      toast.error(`Download failed: ${error.message}`);
    },
  });
}

// Revoke certificate mutation
export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      certificateService.revokeCertificate(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
      toast.success('Certificate revoked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke certificate: ${error.message}`);
    },
  });
}
