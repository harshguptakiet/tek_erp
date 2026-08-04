'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { liveClassService } from '@/services/live-class.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Video } from 'lucide-react';
import { useEffect } from 'react';

// Form schema
const liveClassSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  scheduledAt: z.string().min(1, 'Start time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  platform: z.enum(['zoom', 'google_meet', 'teams', 'custom']),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  meetingId: z.string().optional(),
  passcode: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  recordingEnabled: z.boolean().optional(),
  isRecorded: z.boolean().optional(),
});

type LiveClassFormData = z.infer<typeof liveClassSchema>;

export default function EditLiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const classId = params.id as string;

  // Fetch live class details
  const { data: liveClass, isLoading } = useQuery({
    queryKey: ['live-class', classId],
    queryFn: () => liveClassService.getLiveClass(classId),
    enabled: !!classId,
  });

  // Fetch classes for dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/classes?schoolId=${user?.schoolId}`);
      return response.json();
    },
    enabled: !!user?.schoolId,
  });

  // Fetch subjects for dropdown
  const { data: subjects } = useQuery({
    queryKey: ['subjects', user?.schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/subjects?schoolId=${user?.schoolId}`);
      return response.json();
    },
    enabled: !!user?.schoolId,
  });

  // Form setup
  const form = useForm<LiveClassFormData>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: {
      title: '',
      description: '',
      classId: '',
      subjectId: '',
      scheduledAt: '',
      duration: 60,
      platform: 'zoom',
      meetingUrl: '',
      meetingId: '',
      passcode: '',
      maxParticipants: 100,
      recordingEnabled: false,
      isRecorded: false,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (liveClass) {
      // Convert scheduledAt to datetime-local format
      const scheduledDate = new Date(liveClass.scheduledAt);
      const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      form.reset({
        title: liveClass.title || '',
        description: liveClass.description || '',
        classId: liveClass.classId || '',
        subjectId: liveClass.subjectId || '',
        scheduledAt: localDateTime,
        duration: liveClass.duration || 60,
        platform: liveClass.platform || 'zoom',
        meetingUrl: liveClass.meetingUrl || '',
        meetingId: liveClass.meetingId || '',
        passcode: liveClass.passcode || '',
        maxParticipants: liveClass.maxParticipants || 100,
        recordingEnabled: liveClass.recordingEnabled || false,
        isRecorded: liveClass.isRecorded || false,
      });
    }
  }, [liveClass, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: LiveClassFormData) =>
      liveClassService.updateLiveClass(classId, data),
    onSuccess: () => {
      toast.success('Live class updated successfully');
      queryClient.invalidateQueries({ queryKey: ['live-class', classId] });
      queryClient.invalidateQueries({ queryKey: ['live-classes'] });
      router.push(`/live-classes/${classId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update live class');
    },
  });

  // Handle form submission
  const onSubmit = (data: LiveClassFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Live class not found</p>
            <Button onClick={() => router.push('/live-classes')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Live Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't allow editing if class has already started
  const hasStarted = new Date(liveClass.scheduledAt) < new Date();

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/live-classes/${classId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Edit Live Class</h1>
            <p className="text-muted-foreground">Update class details</p>
          </div>
        </div>
      </div>

      {hasStarted && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-800">
              ⚠️ This class has already started. Some fields may be locked.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="e.g., Introduction to Algebra"
                disabled={hasStarted}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Brief description of the class..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select
                  value={form.watch('classId')}
                  onValueChange={(value) => form.setValue('classId', value)}
                  disabled={hasStarted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.classId && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.classId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <Select
                  value={form.watch('subjectId')}
                  onValueChange={(value) => form.setValue('subjectId', value)}
                  disabled={hasStarted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.subjectId && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.subjectId.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledAt">Start Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...form.register('scheduledAt')}
                  disabled={hasStarted}
                />
                {form.formState.errors.scheduledAt && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.scheduledAt.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  {...form.register('duration', { valueAsNumber: true })}
                  min={15}
                  step={15}
                />
                {form.formState.errors.duration && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.duration.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={form.watch('platform')}
                onValueChange={(value: any) => form.setValue('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="custom">Custom Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="meetingUrl">Meeting URL</Label>
              <Input
                id="meetingUrl"
                {...form.register('meetingUrl')}
                placeholder="https://..."
                type="url"
              />
              {form.formState.errors.meetingUrl && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.meetingUrl.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingId">Meeting ID</Label>
                <Input
                  id="meetingId"
                  {...form.register('meetingId')}
                  placeholder="123-456-789"
                />
              </div>

              <div>
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  {...form.register('passcode')}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...form.register('maxParticipants', { valueAsNumber: true })}
                  min={1}
                />
              </div>

              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register('recordingEnabled')}
                    className="rounded"
                  />
                  <span className="text-sm">Enable Recording</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/live-classes/${classId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
