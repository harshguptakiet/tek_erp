/**
 * Module 13: Assignments - Edit Assignment
 * FR-ASSIGNMENT-003: Edit assignment details
 */

'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { assignmentService } from '@/services/assignment.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const assignmentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.number().min(1, 'Maximum marks required'),
  instructions: z.string().optional(),
});

type AssignmentForm = z.infer<typeof assignmentSchema>;

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch assignment data
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });

  // Fetch subjects
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  // Fetch classes
  const { data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentForm>({
    resolver: zodResolver(assignmentSchema),
    values: assignment
      ? {
          title: assignment.title || '',
          description: assignment.description || '',
          subjectId: assignment.subjectId || '',
          classId: assignment.classId || '',
          dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
          maxMarks: assignment.maxMarks || 100,
          instructions: assignment.instructions || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssignmentForm) =>
      assignmentService.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment updated successfully!');
      router.push(`/assignments/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    },
  });

  const onSubmit = (data: AssignmentForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Assignment not found</p>
          <Button className="mt-4" onClick={() => router.push('/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/assignments/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Assignment</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input {...register('title')} placeholder="Assignment title" />
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
                placeholder="Describe what students need to do..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <Select {...register('subjectId')}>
                  <option value="">Select subject...</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
                {errors.subjectId && (
                  <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <Select {...register('classId')}>
                  <option value="">Select class...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
                {errors.classId && (
                  <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Marks *
                </label>
                <Input
                  type="number"
                  {...register('maxMarks', { valueAsNumber: true })}
                  min="1"
                />
                {errors.maxMarks && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxMarks.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date & Time *
              </label>
              <Input type="datetime-local" {...register('dueDate')} />
              {errors.dueDate && (
                <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (Optional)
              </label>
              <Textarea
                {...register('instructions')}
                rows={3}
                placeholder="Additional instructions or guidelines..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/assignments/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Assignment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
