'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateExam, useUpdateExam } from './use-exams';

const examSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  examType: z.string().min(1, 'Exam type is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  sectionId: z.string().min(1, 'Section is required'),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1, 'Total marks must be greater than 0'),
  passingMarks: z.number().min(0, 'Passing marks must be 0 or greater'),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  examId?: string;
  initialData?: Partial<ExamFormData>;
  subjects?: Array<{ id: string; name: string }>;
  sections?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ExamForm({
  examId,
  initialData,
  subjects = [],
  sections = [],
  onSuccess,
}: ExamFormProps) {
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ExamFormData) => {
    if (examId) {
      await updateExam.mutateAsync({ id: examId, data });
    } else {
      await createExam.mutateAsync(data);
    }
    onSuccess?.();
  };

  const examTypes = [
    { value: 'midterm', label: 'Mid-Term Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'unit', label: 'Unit Test' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'practical', label: 'Practical Exam' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{examId ? 'Edit Exam' : 'Create New Exam'}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Exam Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="e.g., Mathematics Mid-Term Exam"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Exam Type <span className="text-red-500">*</span>
            </label>
            <Select {...register('examType')}>
              <option value="">Select exam type</option>
              {examTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            {errors.examType && (
              <p className="text-red-500 text-sm mt-1">{errors.examType.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <Select {...register('subjectId')}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm mt-1">{errors.subjectId.message}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <Select {...register('sectionId')}>
              <option value="">Select section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Select>
            {errors.sectionId && (
              <p className="text-red-500 text-sm mt-1">{errors.sectionId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 60"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Marks */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('totalMarks', { valueAsNumber: true })}
                placeholder="e.g., 100"
              />
              {errors.totalMarks && (
                <p className="text-red-500 text-sm mt-1">{errors.totalMarks.message}</p>
              )}
            </div>

            {/* Passing Marks */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Passing Marks <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('passingMarks', { valueAsNumber: true })}
                placeholder="e.g., 40"
              />
              {errors.passingMarks && (
                <p className="text-red-500 text-sm mt-1">{errors.passingMarks.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createExam.isPending || updateExam.isPending}
          >
            {(createExam.isPending || updateExam.isPending) && (
              <span className="mr-2">⏳</span>
            )}
            {examId ? 'Update Exam' : 'Create Exam'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
