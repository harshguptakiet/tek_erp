import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportService } from '@/services/transport.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const transportKeys = {
  all: ['transport'] as const,
  buses: () => [...transportKeys.all, 'buses'] as const,
  bus: (id: string) => [...transportKeys.buses(), id] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  route: (id: string) => [...transportKeys.routes(), id] as const,
  assignments: () => [...transportKeys.all, 'assignments'] as const,
  assignmentsByStudent: (studentId: string) => [...transportKeys.assignments(), studentId] as const,
};

// Fetch buses list
export function useBuses(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...transportKeys.buses(), filters],
    queryFn: () => transportService.listBuses(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single bus
export function useBus(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: transportKeys.bus(id),
    queryFn: () => transportService.getBus(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch routes list
export function useRoutes(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...transportKeys.routes(), filters],
    queryFn: () => transportService.listRoutes(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single route
export function useRoute(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: transportKeys.route(id),
    queryFn: () => transportService.getRoute(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch student transport assignments
export function useStudentTransportAssignment(studentId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: transportKeys.assignmentsByStudent(studentId),
    queryFn: () => transportService.getStudentAssignment(studentId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Add bus mutation
export function useAddBus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => transportService.addBus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.buses() });
      toast.success('Bus added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add bus: ${error.message}`);
    },
  });
}

// Update bus mutation
export function useUpdateBus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transportService.updateBus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.bus(variables.id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.buses() });
      toast.success('Bus updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bus: ${error.message}`);
    },
  });
}

// Create route mutation
export function useCreateRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => transportService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      toast.success('Route created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create route: ${error.message}`);
    },
  });
}

// Update route mutation
export function useUpdateRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transportService.updateRoute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.route(variables.id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      toast.success('Route updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update route: ${error.message}`);
    },
  });
}

// Assign student to route mutation
export function useAssignStudentToRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => transportService.assignStudent(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.assignments() });
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: transportKeys.assignmentsByStudent(variables.studentId) });
      }
      toast.success('Student assigned to route');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign student: ${error.message}`);
    },
  });
}

// Unassign student from route mutation
export function useUnassignStudentFromRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => transportService.unassignStudent(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.assignments() });
      toast.success('Student unassigned from route');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unassign student: ${error.message}`);
    },
  });
}
