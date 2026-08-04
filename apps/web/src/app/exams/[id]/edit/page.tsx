/**
 * Module 09: Assessment - Edit Exam
 * FR-EXAM-003: Edit exam details
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
import { examService } from '@/services/exam.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const examSchema = z.object({
  name: z.string().min(5, 'Exam name must be at least 5 characters'),
  description: z.string().min(10, 'Description required'),
  examType: z.string().min(1, 'Exam type is required'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalMarks: z.number().min(1, 'Total marks required'),
  passingMarks: z.number().min(1, 'Passing marks required'),
  gradeScale: z.string().optional(),
});

type ExamForm = z.infer<typeof examSchema>;

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch exam data
  const { data: exam, isLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });

  // Fetch academic years
  const { data: academicYearsResponse } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const academicYears = Array.isArray(academicYearsResponse)
    ? academicYearsResponse
    : academicYearsResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    values: exam
      ? {
          name: exam.name || '',
          description: exam.description || '',
          examType: exam.type || '',
          academicYearId: exam.academicYearId || '',
          startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 10) : '',
          endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 10) : '',
          totalMarks: exam.totalMarks || 0,
          passingMarks: exam.passingMarks || 0,
          gradeScale: exam.gradeScale || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExamForm) =>
      examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated successfully!');
      router.push(`/exams/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    },
  });

  const onSubmit = (data: ExamForm) => {
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

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Exam not found</p>
          <Button className="mt-4" onClick={() => router.push('/exams')}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/exams/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Exam</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name *
              </label>
              <Input {...register('name')} placeholder="e.g., Mid-Term Examination 2024" />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea {...register('description')} rows={3} />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type *
                </label>
                <Select {...register('examType')}>
                  <option value="">Select type...</option>
                  <option value="UNIT_TEST">Unit Test</option>
                  <option value="MIDTERM">Mid-Term</option>
                  <option value="FINAL">Final</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="HALF_YEARLY">Half-Yearly</option>
                  <option value="ANNUAL">Annual</option>
                </Select>
                {errors.examType && (
                  <p className="text-sm text-red-600 mt-1">{errors.examType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <Select {...register('academicYearId')}>
                  <option value="">Select year...</option>
                  {academicYears.map((year: any) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
                {errors.academicYearId && (
                  <p className="text-sm text-red-600 mt-1">{errors.academicYearId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <Input
                  type="number"
                  {...register('totalMarks', { valueAsNumber: true })}
                  min="1"
                />
                {errors.totalMarks && (
                  <p className="text-sm text-red-600 mt-1">{errors.totalMarks.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Marks *
                </label>
                <Input
                  type="number"
                  {...register('passingMarks', { valueAsNumber: true })}
                  min="1"
                />
                {errors.passingMarks && (
                  <p className="text-sm text-red-600 mt-1">{errors.passingMarks.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Scale
                </label>
                <Select {...register('gradeScale')}>
                  <option value="">Select...</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="GPA">GPA (4.0)</option>
                  <option value="LETTER">Letter (A-F)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/exams/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Exam'}
          </Button>
        </div>
      </form>
    </div>
  );
}
