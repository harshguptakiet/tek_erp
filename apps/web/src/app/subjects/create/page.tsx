/**
 * Module 04: Academic - Create Subject
 * FR-SUBJECT-001: Add subject to catalog
 */

'use client';

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

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z
    .string()
    .min(2, 'Code is required')
    .max(10)
    .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, or underscores'),
  category: z.enum(['CORE', 'ELECTIVE', 'OPTIONAL']),
  description: z.string().min(10, 'Add a short description'),
  weeklyHours: z.coerce.number().min(1).max(20),
  practicalHours: z.coerce.number().min(0).max(10),
  labRequired: z.enum(['yes', 'no']),
});

type SubjectForm = z.infer<typeof subjectSchema>;

export default function CreateSubjectPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubjectForm>({
    resolver: formResolver(subjectSchema),
    defaultValues: {
      category: 'CORE',
      weeklyHours: 4,
      practicalHours: 0,
      labRequired: 'no',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SubjectForm) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const id = `sub-${data.code.toLowerCase()}`;
      return { id, ...data };
    },
    onSuccess: (data) => {
      toast.success('Subject created successfully');
      router.push(`/subjects/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create subject');
    },
  });

  const onSubmit = (data: SubjectForm) => {
    createMutation.mutate(data);
  };

  return (
    <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects')}>
            ← Back to subjects
          </Button>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Add subject</h1>
          <p className="mt-2 text-sm text-gray-600">Define a new subject for your academic catalog</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject name</label>
                <Input className="mt-1" placeholder="e.g. Mathematics" {...register('name')} error={errors.name?.message} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject code</label>
                  <Input className="mt-1" placeholder="MATH" {...register('code')} error={errors.code?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <Select className="mt-1" {...register('category')}>
                    <option value="CORE">Core</option>
                    <option value="ELECTIVE">Elective</option>
                    <option value="OPTIONAL">Optional</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  placeholder="Brief overview of the subject..."
                  {...register('description')}
                  error={errors.description?.message}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & lab</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly hours</label>
                <Input type="number" className="mt-1" {...register('weeklyHours')} error={errors.weeklyHours?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Practical hours</label>
                <Input type="number" className="mt-1" {...register('practicalHours')} error={errors.practicalHours?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lab required</label>
                <Select className="mt-1" {...register('labRequired')}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/subjects')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create subject'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
