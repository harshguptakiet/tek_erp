/**
 * Module 13: Assignments - Create Assignment Page
 * FR-ASSIGN-005: Create new assignment with details, instructions, and attachments
 */

'use client';

import { useState } from 'react';
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

// Validation schema
const assignmentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['HOMEWORK', 'PROJECT', 'LAB_REPORT', 'ESSAY', 'PRESENTATION', 'QUIZ', 'OTHER']),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().min(1, 'Due time is required'),
  totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.coerce.number().min(0, 'Passing marks cannot be negative'),
  allowLateSubmission: z.boolean(),
  latePenaltyPercent: z.coerce.number().min(0).max(100).optional(),
  instructions: z.string().optional(),
  attachmentLinks: z.string().optional(),
});

type AssignmentForm = z.infer<typeof assignmentSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssignmentForm>({
    resolver: formResolver(assignmentSchema),
    defaultValues: {
      type: 'HOMEWORK',
      allowLateSubmission: false,
      latePenaltyPercent: 10,
    },
  });

  const allowLateSubmission = watch('allowLateSubmission');

  const createMutation = useMutation({
    mutationFn: async (data: AssignmentForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-assignment-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Assignment created successfully');
      router.push(`/assignments/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create assignment');
    },
  });

  const onSubmit = (data: AssignmentForm) => {
    createMutation.mutate(data);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Can
      permission={PERMISSIONS.ASSIGNMENTS_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create assignments</p>
            <Button className="mt-4" onClick={() => router.push('/assignments')}>
              Back to Assignments
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/assignments')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and assign homework, projects, or assessments to students
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Basic Details' },
              { num: 2, title: 'Instructions' },
              { num: 3, title: 'Settings' },
            ].map((s) => (
              <div key={s.num} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  {s.num < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <p className="text-sm mt-2 text-gray-600">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Title *
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="e.g., Chapter 5 Homework - Quadratic Equations"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Provide a brief description of the assignment..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Type *
                    </label>
                    <Select {...register('type')}>
                      <option value="HOMEWORK">Homework</option>
                      <option value="PROJECT">Project</option>
                      <option value="LAB_REPORT">Lab Report</option>
                      <option value="ESSAY">Essay</option>
                      <option value="PRESENTATION">Presentation</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="OTHER">Other</option>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <Select {...register('subjectId')}>
                      <option value="">Select subject</option>
                      <option value="math">Mathematics</option>
                      <option value="science">Science</option>
                      <option value="english">English</option>
                      <option value="social">Social Studies</option>
                      <option value="hindi">Hindi</option>
                    </Select>
                    {errors.subjectId && (
                      <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <Select {...register('classId')}>
                      <option value="">Select class</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </Select>
                    {errors.classId && (
                      <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    <Select {...register('sectionId')}>
                      <option value="">Select section</option>
                      <option value="a">Section A</option>
                      <option value="b">Section B</option>
                      <option value="c">Section C</option>
                    </Select>
                    {errors.sectionId && (
                      <p className="text-sm text-red-600 mt-1">{errors.sectionId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date *
                    </label>
                    <Input type="date" {...register('dueDate')} />
                    {errors.dueDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Time *
                    </label>
                    <Input type="time" {...register('dueTime')} />
                    {errors.dueTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.dueTime.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Instructions */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Instructions
                  </label>
                  <Textarea
                    {...register('instructions')}
                    placeholder="Provide detailed instructions for students...&#10;• Point 1&#10;• Point 2&#10;• Point 3"
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide clear, step-by-step instructions for completing the assignment
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Links (Optional)
                  </label>
                  <Textarea
                    {...register('attachmentLinks')}
                    placeholder="Add reference links, one per line..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add helpful resources, study materials, or reference links
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs">PDF, DOC, PPT (max. 10MB)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks *
                    </label>
                    <Input
                      type="number"
                      {...register('totalMarks')}
                      min="1"
                      placeholder="100"
                    />
                    {errors.totalMarks && (
                      <p className="text-sm text-red-600 mt-1">{errors.totalMarks.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Marks *
                    </label>
                    <Input
                      type="number"
                      {...register('passingMarks')}
                      min="0"
                      placeholder="40"
                    />
                    {errors.passingMarks && (
                      <p className="text-sm text-red-600 mt-1">{errors.passingMarks.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    {...register('allowLateSubmission')}
                    className="rounded"
                  />
                  <label htmlFor="allowLateSubmission" className="text-sm font-medium text-gray-700">
                    Allow late submissions
                  </label>
                </div>

                {allowLateSubmission && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Late Penalty (%)
                    </label>
                    <Input
                      type="number"
                      {...register('latePenaltyPercent')}
                      min="0"
                      max="100"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of marks deducted per day for late submissions
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Summary</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Assignment will be visible to students immediately</li>
                    <li>• Students can submit until the due date</li>
                    <li>• You'll be notified of new submissions</li>
                    <li>• Grades can be entered after submissions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/assignments')}
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Can>
  );
}
