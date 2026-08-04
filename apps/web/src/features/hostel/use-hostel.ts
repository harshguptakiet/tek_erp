import { useQuery, useMutation, useQueryClient } from '@tantml:query';
import { hostelService } from '@/services/hostel.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const hostelKeys = {
  all: ['hostel'] as const,
  rooms: () => [...hostelKeys.all, 'rooms'] as const,
  room: (id: string) => [...hostelKeys.rooms(), id] as const,
  allocations: () => [...hostelKeys.all, 'allocations'] as const,
  allocation: (id: string) => [...hostelKeys.allocations(), id] as const,
  allocationsByStudent: (studentId: string) => [...hostelKeys.allocations(), studentId] as const,
  available: () => [...hostelKeys.all, 'available'] as const,
};

// Fetch rooms list
export function useRooms(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...hostelKeys.rooms(), filters],
    queryFn: () => hostelService.listRooms(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single room
export function useRoom(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: hostelKeys.room(id),
    queryFn: () => hostelService.getRoom(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch available rooms
export function useAvailableRooms() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: hostelKeys.available(),
    queryFn: () => hostelService.getAvailableRooms(),
    enabled: !!user?.schoolId,
  });
}

// Fetch allocations
export function useAllocations(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...hostelKeys.allocations(), filters],
    queryFn: () => hostelService.listAllocations(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch allocation by student
export function useStudentAllocation(studentId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: hostelKeys.allocationsByStudent(studentId),
    queryFn: () => hostelService.getStudentAllocation(studentId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Add room mutation
export function useAddRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => hostelService.addRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.available() });
      toast.success('Room added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add room: ${error.message}`);
    },
  });
}

// Update room mutation
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      hostelService.updateRoom(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.room(variables.id) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      toast.success('Room updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update room: ${error.message}`);
    },
  });
}

// Allocate room mutation
export function useAllocateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => hostelService.allocateRoom(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocations() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.available() });
      if (variables.roomId) {
        queryClient.invalidateQueries({ queryKey: hostelKeys.room(variables.roomId) });
      }
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: hostelKeys.allocationsByStudent(variables.studentId) });
      }
      toast.success('Room allocated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to allocate room: ${error.message}`);
    },
  });
}

// Deallocate room mutation
export function useDeallocateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (allocationId: string) => hostelService.deallocateRoom(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocations() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.available() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      toast.success('Room deallocated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to deallocate room: ${error.message}`);
    },
  });
}
