'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { FileUploader } from '@/components/ui/file-uploader';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateAssignment, useUpdateAssignment } from './use-assignments';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  sectionId: z.string().min(1, 'Section is required'),
  dueDate: z.date(),
  dueTime: z.string().min(1, 'Due time is required'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().optional(),
  instructions: z.string().optional(),
  allowLateSubmission: z.boolean().default(false),
  maxFileSize: z.number().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  initialData?: Partial<AssignmentFormData> & { id?: string };
  subjects?: Array<{ id: string; name: string }>;
  sections?: Array<{ id: string; name: string }>;
}

export function AssignmentForm({
  initialData,
  subjects = [],
  sections = [],
}: AssignmentFormProps) {
  const router = useRouter();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();

  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  );
  const [dueTime, setDueTime] = useState<string>(initialData?.dueTime || '23:59');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [allowLateSubmission, setAllowLateSubmission] = useState(
    initialData?.allowLateSubmission || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      ...initialData,
      allowLateSubmission,
    },
  });

  const totalMarks = watch('totalMarks');

  const onSubmit = async (data: AssignmentFormData) => {
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      // Combine date and time
      const dueDateTime = new Date(dueDate);
      const [hours, minutes] = dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));

      const submitData = {
        ...data,
        dueDate: dueDateTime.toISOString(),
        attachments: attachments.map((f) => f.name), // In real app, upload files first
        allowLateSubmission,
      };

      if (initialData?.id) {
        await updateAssignment.mutateAsync({
          id: initialData.id,
          data: submitData,
        });
      } else {
        await createAssignment.mutateAsync(submitData);
      }

      router.push('/assignments');
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Assignment title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </label>
              <SelectRoot
                onValueChange={(value) => setValue('subjectId', value)}
                defaultValue={initialData?.subjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              {errors.subjectId && (
                <p className="text-sm text-red-500">{errors.subjectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Section <span className="text-red-500">*</span>
              </label>
              <SelectRoot
                onValueChange={(value) => setValue('sectionId', value)}
                defaultValue={initialData?.sectionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              {errors.sectionId && (
                <p className="text-sm text-red-500">{errors.sectionId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('description')}
              placeholder="Describe the assignment..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions</label>
            <Textarea
              {...register('instructions')}
              placeholder="Additional instructions for students..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Due Date & Marks */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Due Date & Grading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Due Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              date={dueDate}
              onDateChange={(date) => {
                setDueDate(date);
                setValue('dueDate', date!);
              }}
              placeholder="Select due date"
              fromDate={new Date()}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Due Time <span className="text-red-500">*</span>
            </label>
            <TimePicker
              time={dueTime}
              onTimeChange={(time) => {
                setDueTime(time);
                setValue('dueTime', time);
              }}
              placeholder="Select due time"
            />
            {errors.dueTime && (
              <p className="text-sm text-red-500">{errors.dueTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('totalMarks', { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="100"
            />
            {errors.totalMarks && (
              <p className="text-sm text-red-500">{errors.totalMarks.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Passing Marks</label>
            <Input
              {...register('passingMarks', { valueAsNumber: true })}
              type="number"
              min="1"
              max={totalMarks}
              placeholder="40"
            />
            {errors.passingMarks && (
              <p className="text-sm text-red-500">{errors.passingMarks.message}</p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowLateSubmission"
            checked={allowLateSubmission}
            onCheckedChange={(checked) => {
              setAllowLateSubmission(checked as boolean);
              setValue('allowLateSubmission', checked as boolean);
            }}
          />
          <label
            htmlFor="allowLateSubmission"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Allow late submissions
          </label>
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Attachments</h2>
        <FileUploader
          value={attachments}
          onChange={setAttachments}
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          showPreview={true}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Upload reference materials, worksheets, or additional resources
        </p>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Save as draft logic
            toast.success('Saved as draft');
          }}
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Publishing...'
            : initialData?.id
            ? 'Update Assignment'
            : 'Publish Assignment'}
        </Button>
      </div>
    </form>
  );
}
