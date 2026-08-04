/**
 * Module 08: Events - Create Event
 * FR-EVENT-001: Create new school event
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { eventService } from '@/services/event.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  eventType: z.string().min(1, 'Event type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  maxParticipants: z.number().min(1).optional(),
  isPublic: z.boolean().default(false),
  requiresRegistration: z.boolean().default(true),
});

type EventForm = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isPublic: false,
      requiresRegistration: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: EventForm) =>
      eventService.createEvent({
        ...data,
        schoolId: user?.schoolId || '',
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
      router.push(`/events/${data.id || ''}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    },
  });

  const onSubmit = (data: EventForm) => {
    createMutation.mutate(data);
  };

  const requiresRegistration = watch('requiresRegistration');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/events')}>
          ← Back to Events
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Create Event</h1>
        <p className="text-sm text-gray-600 mt-2">
          Organize school events, competitions, and activities
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input {...register('title')} placeholder="e.g., Annual Sports Day 2024" />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                {...register('description')}
                rows={4}
                placeholder="Describe the event, activities, and what participants can expect..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <Select {...register('eventType')}>
                  <option value="">Select type...</option>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                  <option value="celebration">Celebration</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </Select>
                {errors.eventType && (
                  <p className="text-sm text-red-600 mt-1">{errors.eventType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Input {...register('location')} placeholder="e.g., School Auditorium" />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <Input type="datetime-local" {...register('startDate')} />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <Input type="datetime-local" {...register('endDate')} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <Checkbox {...register('requiresRegistration')} />
                <span className="text-sm font-medium text-gray-700">
                  Requires Registration
                </span>
              </label>

              {requiresRegistration && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Participants
                  </label>
                  <Input
                    type="number"
                    {...register('maxParticipants', { valueAsNumber: true })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited participants
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2">
                <Checkbox {...register('isPublic')} />
                <span className="text-sm font-medium text-gray-700">
                  Public Event (visible to parents)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/events')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
