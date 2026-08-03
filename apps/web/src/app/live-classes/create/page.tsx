/**
 * Module 11: Live Classes - Create/Schedule Class Page
 * FR-LIVE-005: Schedule new virtual classroom session
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

// Validation schema
const liveClassSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours'),
  platform: z.enum(['ZOOM', 'GOOGLE_MEET', 'MS_TEAMS', 'CUSTOM']),
  meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  maxParticipants: z.coerce.number().min(1, 'Must allow at least 1 participant').max(500),
  enableRecording: z.boolean(),
  enableChat: z.boolean(),
  enableScreenShare: z.boolean(),
  enableWaitingRoom: z.boolean(),
  sendReminder: z.boolean(),
  reminderMinutes: z.coerce.number().optional(),
  agenda: z.string().optional(),
});

type LiveClassForm = z.infer<typeof liveClassSchema>;

export default function CreateLiveClassPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LiveClassForm>({
    resolver: formResolver(liveClassSchema),
    defaultValues: {
      platform: 'ZOOM',
      maxParticipants: 50,
      duration: 60,
      enableRecording: true,
      enableChat: true,
      enableScreenShare: true,
      enableWaitingRoom: false,
      sendReminder: true,
      reminderMinutes: 30,
    },
  });

  const platform = watch('platform');
  const sendReminder = watch('sendReminder');

  const createMutation = useMutation({
    mutationFn: async (data: LiveClassForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-class-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Live class scheduled successfully');
      router.push(`/live-classes/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to schedule live class');
    },
  });

  const onSubmit = (data: LiveClassForm) => {
    createMutation.mutate(data);
  };

  return (
    <Can
      permission={PERMISSIONS.LIVE_CLASSES_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to schedule live classes</p>
            <Button className="mt-4" onClick={() => router.push('/live-classes')}>
              Back to Live Classes
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/live-classes')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Live Class</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new virtual classroom session
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Class Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Title *
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Mathematics - Trigonometry Review Session"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Brief description of what will be covered in this class..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Select {...register('subjectId')}>
                    <option value="">Select subject</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="social">Social Studies</option>
                    <option value="hindi">Hindi</option>
                  </Select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <Select {...register('classId')}>
                    <option value="">Select class</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </Select>
                  {errors.classId && (
                    <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section *
                  </label>
                  <Select {...register('sectionId')}>
                    <option value="">Select section</option>
                    <option value="a">Section A</option>
                    <option value="b">Section B</option>
                    <option value="c">Section C</option>
                  </Select>
                  {errors.sectionId && (
                    <p className="text-sm text-red-600 mt-1">{errors.sectionId.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    {...register('scheduledDate')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.scheduledDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <Input type="time" {...register('startTime')} />
                  {errors.startTime && (
                    <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <Input
                    type="number"
                    {...register('duration')}
                    min="15"
                    max="240"
                    step="15"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">15 to 240 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Platform *
                  </label>
                  <Select {...register('platform')}>
                    <option value="ZOOM">🎥 Zoom</option>
                    <option value="GOOGLE_MEET">📹 Google Meet</option>
                    <option value="MS_TEAMS">💼 Microsoft Teams</option>
                    <option value="CUSTOM">🔗 Custom Link</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants *
                  </label>
                  <Input
                    type="number"
                    {...register('maxParticipants')}
                    min="1"
                    max="500"
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-red-600 mt-1">{errors.maxParticipants.message}</p>
                  )}
                </div>
              </div>

              {platform === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <Input
                    {...register('meetingLink')}
                    type="url"
                    placeholder="https://your-platform.com/meeting/123"
                  />
                  {errors.meetingLink && (
                    <p className="text-sm text-red-600 mt-1">{errors.meetingLink.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Provide the meeting link for custom platforms
                  </p>
                </div>
              )}

              {platform !== 'CUSTOM' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    📌 Meeting link will be auto-generated after scheduling
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Class Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableRecording"
                  {...register('enableRecording')}
                  className="rounded"
                />
                <label htmlFor="enableRecording" className="text-sm font-medium text-gray-700">
                  📹 Enable Recording
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableChat"
                  {...register('enableChat')}
                  className="rounded"
                />
                <label htmlFor="enableChat" className="text-sm font-medium text-gray-700">
                  💬 Enable Chat
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableScreenShare"
                  {...register('enableScreenShare')}
                  className="rounded"
                />
                <label htmlFor="enableScreenShare" className="text-sm font-medium text-gray-700">
                  🖥️ Enable Screen Sharing
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableWaitingRoom"
                  {...register('enableWaitingRoom')}
                  className="rounded"
                />
                <label htmlFor="enableWaitingRoom" className="text-sm font-medium text-gray-700">
                  ⏳ Enable Waiting Room
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendReminder"
                  {...register('sendReminder')}
                  className="rounded"
                />
                <label htmlFor="sendReminder" className="text-sm font-medium text-gray-700">
                  Send reminder to students
                </label>
              </div>

              {sendReminder && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Time (minutes before class)
                  </label>
                  <Select {...register('reminderMinutes')}>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agenda (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Class Agenda (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('agenda')}
                placeholder="Outline topics to be covered, learning objectives, or class structure..."
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a detailed agenda to help students prepare
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/live-classes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Scheduling...' : 'Schedule Class'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
