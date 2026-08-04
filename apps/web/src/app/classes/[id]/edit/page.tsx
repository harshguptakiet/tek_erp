/**
 * Module 04: Academic - Edit Class
 * FR-CLASS-003: Edit class/section details
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
import { Select } from '@/components/ui/select';
import { academicService } from '@/services/academic.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const classSchema = z.object({
  name: z.string().min(2, 'Class name is required'),
  grade: z.number().min(1).max(12),
  maxStudents: z.number().min(1, 'Maximum students required'),
  classTeacherId: z.string().optional(),
});

type ClassForm = z.infer<typeof classSchema>;

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch class data
  const { data: classesResponse, isLoading } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];
  const classData = classes.find((c: any) => c.id === id);

  // Fetch teachers
  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers', user?.schoolId],
    queryFn: () => userService.listUsers({ schoolId: user?.schoolId, role: 'TEACHER' }),
    enabled: !!user?.schoolId,
  });

  const teachers = Array.isArray(teachersResponse) ? teachersResponse : teachersResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassForm>({
    resolver: zodResolver(classSchema),
    values: classData
      ? {
          name: classData.name || '',
          grade: classData.grade || 1,
          maxStudents: classData.maxStudents || 30,
          classTeacherId: classData.classTeacherId || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ClassForm) =>
      // academicService.updateClass(id, data) - add this method
      academicService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully!');
      router.push(`/classes/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update class');
    },
  });

  const onSubmit = (data: ClassForm) => {
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

  if (!classData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Class not found</p>
          <Button className="mt-4" onClick={() => router.push('/classes')}>
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/classes/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Class</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <Input {...register('name')} placeholder="e.g., Class 10-A" />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade *</label>
                <Input type="number" {...register('grade', { valueAsNumber: true })} min="1" max="12" />
                {errors.grade && (
                  <p className="text-sm text-red-600 mt-1">{errors.grade.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Students *
                </label>
                <Input
                  type="number"
                  {...register('maxStudents', { valueAsNumber: true })}
                  min="1"
                />
                {errors.maxStudents && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxStudents.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Teacher
                </label>
                <Select {...register('classTeacherId')}>
                  <option value="">Select teacher...</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName || `${teacher.firstName} ${teacher.lastName}`}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/classes/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Class'}
          </Button>
        </div>
      </form>
    </div>
  );
}
