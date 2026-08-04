'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
  category: z.enum(['CORE', 'ELECTIVE', 'OPTIONAL']),
  weeklyHours: z.number().min(1, 'Weekly hours must be at least 1'),
  practicalHours: z.number().min(0, 'Practical hours cannot be negative'),
  labRequired: z.boolean(),
  gradeLevel: z.number().min(1).max(12),
  maxMarks: z.number().min(1, 'Max marks is required'),
  passMarks: z.number().min(1, 'Pass marks is required'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Partial<SubjectFormData>;
  onSubmit: (data: SubjectFormData) => void;
  isSubmitting?: boolean;
}

export function SubjectForm({ initialData, onSubmit, isSubmitting }: SubjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData || {
      category: 'CORE',
      weeklyHours: 4,
      practicalHours: 0,
      labRequired: false,
      gradeLevel: 10,
      maxMarks: 100,
      passMarks: 40,
    },
  });

  const labRequired = watch('labRequired');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Mathematics"
                error={errors.name?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code *
              </label>
              <Input
                {...register('code')}
                placeholder="e.g., MATH-10"
                error={errors.code?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Brief description of the subject"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <Select {...register('category')} error={errors.category?.message}>
                <option value="CORE">Core</option>
                <option value="ELECTIVE">Elective</option>
                <option value="OPTIONAL">Optional</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level *
              </label>
              <Input
                {...register('gradeLevel', { valueAsNumber: true })}
                type="number"
                min="1"
                max="12"
                error={errors.gradeLevel?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Hours *
              </label>
              <Input
                {...register('weeklyHours', { valueAsNumber: true })}
                type="number"
                min="1"
                error={errors.weeklyHours?.message}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laboratory & Practical</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={labRequired}
              onCheckedChange={(checked) => setValue('labRequired', checked as boolean)}
            />
            <label className="text-sm font-medium text-gray-700">
              Laboratory Required
            </label>
          </div>

          {labRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practical Hours per Week
              </label>
              <Input
                {...register('practicalHours', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Marks *
              </label>
              <Input
                {...register('maxMarks', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="100"
                error={errors.maxMarks?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pass Marks *
              </label>
              <Input
                {...register('passMarks', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="40"
                error={errors.passMarks?.message}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
}
