/**
 * Module 09: Assessment - Create Exam
 * FR-EXAM-001: Create and configure exams
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

// Validation schema
const examSchema = z.object({
  name: z.string().min(3, 'Exam name must be at least 3 characters'),
  type: z.enum(['UNIT_TEST', 'MID_TERM', 'FINAL', 'PRACTICAL', 'ASSIGNMENT']),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.enum(['TERM_1', 'TERM_2', 'TERM_3']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
  subjects: z.array(z.object({
    subjectId: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().min(1),
    duration: z.number().min(30),
    maxMarks: z.number().min(1),
    passingMarks: z.number().min(1),
    roomNumber: z.string().optional(),
  })).min(1, 'At least one subject is required'),
  classes: z.array(z.string()).min(1, 'At least one class is required'),
  instructions: z.string().optional(),
  syllabusUrl: z.string().optional(),
});

type ExamForm = z.infer<typeof examSchema>;

export default function CreateExamPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([
    {
      subjectId: '',
      date: '',
      startTime: '',
      duration: 180,
      maxMarks: 100,
      passingMarks: 33,
      roomNumber: '',
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExamForm>({
    resolver: formResolver(examSchema),
    defaultValues: {
      academicYear: '2024-2025',
      term: 'TERM_1',
      subjects: subjects,
      classes: [],
    },
  });

  // Mock data
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => [
      { id: 'c1', name: 'Class 9' },
      { id: 'c2', name: 'Class 10' },
      { id: 'c3', name: 'Class 11' },
      { id: 'c4', name: 'Class 12' },
    ],
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => [
      { id: 's1', name: 'Mathematics', code: 'MATH' },
      { id: 's2', name: 'Physics', code: 'PHY' },
      { id: 's3', name: 'Chemistry', code: 'CHEM' },
      { id: 's4', name: 'Biology', code: 'BIO' },
      { id: 's5', name: 'English', code: 'ENG' },
      { id: 's6', name: 'Hindi', code: 'HIN' },
      { id: 's7', name: 'Social Science', code: 'SST' },
      { id: 's8', name: 'Computer Science', code: 'CS' },
    ],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExamForm) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-exam-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Exam created successfully');
      router.push(`/exams/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create exam');
    },
  });

  const addSubject = () => {
    const newSubject = {
      subjectId: '',
      date: '',
      startTime: '',
      duration: 180,
      maxMarks: 100,
      passingMarks: 33,
      roomNumber: '',
    };
    setSubjects([...subjects, newSubject]);
    setValue('subjects', [...subjects, newSubject]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
      setValue('subjects', newSubjects);
    }
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
    setValue('subjects', newSubjects);
  };

  const selectedClasses = watch('classes') || [];

  const toggleClass = (classId: string) => {
    const current = selectedClasses;
    const updated = current.includes(classId)
      ? current.filter((id) => id !== classId)
      : [...current, classId];
    setValue('classes', updated);
  };

  const onSubmit = (data: ExamForm) => {
    createMutation.mutate(data);
  };


  return (
    <Can
      permission={PERMISSIONS.EXAMS_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create exams</p>
            <Button className="mt-4" onClick={() => router.push('/exams')}>
              Back to Exams
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/exams')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up a new exam with subjects, schedules, and configurations
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <Input {...register('name')} placeholder="e.g., First Term Examination 2024" />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type *
                  </label>
                  <Select {...register('type')}>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="MID_TERM">Mid-Term Exam</option>
                    <option value="FINAL">Final Exam</option>
                    <option value="PRACTICAL">Practical Exam</option>
                    <option value="ASSIGNMENT">Assignment Based</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term *
                  </label>
                  <Select {...register('term')}>
                    <option value="TERM_1">Term 1</option>
                    <option value="TERM_2">Term 2</option>
                    <option value="TERM_3">Term 3</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <Select {...register('academicYear')}>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input type="date" {...register('startDate')} />
                  {errors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Input type="date" {...register('endDate')} />
                  {errors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Brief description about this exam..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Applicable Classes *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {classesData?.map((cls: any) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedClasses.includes(cls.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      {selectedClasses.includes(cls.id) && (
                        <Badge variant="success" className="mt-2">✓ Selected</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.classes && (
                <p className="text-sm text-red-600 mt-2">{errors.classes.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Subjects Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subject-wise Schedule *</CardTitle>
                <Button type="button" onClick={addSubject} size="sm">
                  + Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 relative"
                >
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <Select
                        value={subject.subjectId}
                        onChange={(e) => updateSubject(index, 'subjectId', e.target.value)}
                      >
                        <option value="">Select Subject</option>
                        {subjectsData?.map((subj: any) => (
                          <option key={subj.id} value={subj.id}>
                            {subj.name} ({subj.code})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exam Date *
                      </label>
                      <Input
                        type="date"
                        value={subject.date}
                        onChange={(e) => updateSubject(index, 'date', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <Input
                        type="time"
                        value={subject.startTime}
                        onChange={(e) => updateSubject(index, 'startTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (min) *
                      </label>
                      <Input
                        type="number"
                        value={subject.duration}
                        onChange={(e) => updateSubject(index, 'duration', parseInt(e.target.value))}
                        min="30"
                        step="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Marks *
                      </label>
                      <Input
                        type="number"
                        value={subject.maxMarks}
                        onChange={(e) => updateSubject(index, 'maxMarks', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passing Marks *
                      </label>
                      <Input
                        type="number"
                        value={subject.passingMarks}
                        onChange={(e) => updateSubject(index, 'passingMarks', parseInt(e.target.value))}
                        min="1"
                        max={subject.maxMarks}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <Input
                        value={subject.roomNumber}
                        onChange={(e) => updateSubject(index, 'roomNumber', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.subjects && (
                <p className="text-sm text-red-600">{errors.subjects.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Instructions
                </label>
                <Textarea
                  {...register('instructions')}
                  placeholder="General instructions for students (reporting time, materials allowed, etc.)"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Syllabus URL
                </label>
                <Input
                  {...register('syllabusUrl')}
                  placeholder="https://example.com/syllabus.pdf"
                  type="url"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to syllabus document or exam pattern
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Subjects:</span>
                  <Badge variant="info">{subjects.filter(s => s.subjectId).length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Classes:</span>
                  <Badge variant="info">{selectedClasses.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Marks:</span>
                  <Badge variant="info">
                    {subjects.reduce((sum, s) => sum + s.maxMarks, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Exam Duration:</span>
                  <Badge variant="info">
                    {watch('startDate') && watch('endDate')
                      ? `${watch('startDate')} to ${watch('endDate')}`
                      : 'Not set'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/exams')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
