'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'z od';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { DatePicker } from '@/components/ui/date-picker';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  dueDate: z.date(),
  maxMarks: z.number().min(1, 'Max marks is required'),
  submissionType: z.enum(['TEXT', 'FILE', 'BOTH']),
  allowLateSubmission: z.boolean(),
  instructions: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  initialData?: Partial<AssignmentFormData>;
  onSubmit: (data: AssignmentFormData & { attachments?: File[] }) => void;
  isSubmitting?: boolean;
  subjects?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string }>;
}

export function AssignmentForm({
  initialData,
  onSubmit,
  isSubmitting,
  subjects = [],
  classes = [],
}: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: initialData || {
      submissionType: 'BOTH',
      allowLateSubmission: false,
      maxMarks: 100,
    },
  });

  const [attachments, setAttachments] = React.useState<File[]>([]);

  const handleFormSubmit = (data: AssignmentFormData) => {
    onSubmit({ ...data, attachments });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              {...register('title')}
              placeholder="e.g., Chapter 5 Exercises"
              error={errors.title?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Textarea
              {...register('description')}
              placeholder="Describe the assignment..."
              rows={4}
              error={errors.description?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <Select {...register('subjectId')} error={errors.subjectId?.message}>
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <Select {...register('classId')} error={errors.classId?.message}>
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Marks *
              </label>
              <Input
                {...register('maxMarks', { valueAsNumber: true })}
                type="number"
                min="1"
                error={errors.maxMarks?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <DatePicker
                value={watch('dueDate')}
                onChange={(date) => setValue('dueDate', date!)}
                error={errors.dueDate?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Type *
              </label>
              <Select {...register('submissionType')}>
                <option value="TEXT">Text Only</option>
                <option value="FILE">File Only</option>
                <option value="BOTH">Text & File</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('allowLateSubmission')}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Allow late submissions
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('instructions')}
            placeholder="Add any special instructions..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            value={attachments}
            onChange={setAttachments}
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            maxFiles={5}
            maxSize={10}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
}
