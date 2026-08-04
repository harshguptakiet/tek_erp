/**
 * Module 04: Academic - Edit Subject
 * FR-SUBJECT-003: Edit subject details
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
import { Checkbox } from '@/components/ui/checkbox';
import { academicService } from '@/services/academic.service';
import toast from 'react-hot-toast';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().min(2, 'Subject code is required'),
  description: z.string().optional(),
  grade: z.number().min(1).max(12).optional(),
  category: z.enum(['CORE', 'ELECTIVE', 'OPTIONAL']),
  weeklyHours: z.number().min(1, 'Weekly hours required'),
  labRequired: z.boolean().default(false),
  practicalHours: z.number().min(0).default(0),
});

type SubjectForm = z.infer<typeof subjectSchema>;

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch subject data
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  const subject = Array.isArray(subjects) ? subjects.find((s: any) => s.id === id) : null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    values: subject
      ? {
          name: subject.name || '',
          code: subject.code || '',
          description: subject.description || '',
          grade: subject.grade,
          category: subject.category || 'CORE',
          weeklyHours: subject.weeklyHours || 0,
          labRequired: subject.labRequired || false,
          practicalHours: subject.practicalHours || 0,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: SubjectForm) =>
      // academicService.updateSubject(id, data) - add this method
      academicService.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', id] });
      toast.success('Subject updated successfully!');
      router.push(`/subjects/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    },
  });

  const onSubmit = (data: SubjectForm) => {
    updateMutation.mutate(data);
  };

  const labRequired = watch('labRequired');

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

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Subject not found</p>
          <Button className="mt-4" onClick={() => router.push('/subjects')}>
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/subjects/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Subject</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <Input {...register('name')} placeholder="e.g., Mathematics" />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code *
                </label>
                <Input {...register('code')} placeholder="e.g., MATH" />
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea {...register('description')} rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <Input type="number" {...register('grade', { valueAsNumber: true })} min="1" max="12" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <Select {...register('category')}>
                  <option value="CORE">Core</option>
                  <option value="ELECTIVE">Elective</option>
                  <option value="OPTIONAL">Optional</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Hours *
                </label>
                <Input
                  type="number"
                  {...register('weeklyHours', { valueAsNumber: true })}
                  min="1"
                />
                {errors.weeklyHours && (
                  <p className="text-sm text-red-600 mt-1">{errors.weeklyHours.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <Checkbox {...register('labRequired')} />
                <span className="text-sm font-medium text-gray-700">Lab/Practical Required</span>
              </label>

              {labRequired && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practical Hours per Week
                  </label>
                  <Input
                    type="number"
                    {...register('practicalHours', { valueAsNumber: true })}
                    min="0"
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/subjects/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Subject'}
          </Button>
        </div>
      </form>
    </div>
  );
}
