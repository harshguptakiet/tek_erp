import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: any) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  registrations: (eventId: string) => [...eventKeys.all, 'registrations', eventId] as const,
  myRegistrations: () => [...eventKeys.all, 'myRegistrations'] as const,
};

// Fetch events list
export function useEvents(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: eventKeys.list(filters || {}),
    queryFn: () => eventService.listEvents(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single event
export function useEvent(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEvent(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch upcoming events
export function useUpcomingEvents() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: eventKeys.upcoming(),
    queryFn: () => eventService.getUpcomingEvents(),
    enabled: !!user?.schoolId,
  });
}

// Fetch event registrations
export function useEventRegistrations(eventId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: eventKeys.registrations(eventId),
    queryFn: () => eventService.getEventRegistrations(eventId),
    enabled: !!user?.schoolId && !!eventId,
  });
}

// Fetch my registrations
export function useMyEventRegistrations() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: eventKeys.myRegistrations(),
    queryFn: () => eventService.getMyRegistrations(),
    enabled: !!user?.id,
  });
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      eventService.updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Event updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Event deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
}

// Register for event mutation
export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId: string) => eventService.registerForEvent(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrations(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.myRegistrations() });
      toast.success('Registered for event successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to register: ${error.message}`);
    },
  });
}

// Cancel event registration mutation
export function useCancelEventRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (registrationId: string) => eventService.cancelRegistration(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.myRegistrations() });
      toast.success('Registration cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel registration: ${error.message}`);
    },
  });
}
