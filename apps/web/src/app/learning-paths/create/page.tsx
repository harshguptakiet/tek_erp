/**
 * Module 05: Content - Create Learning Path
 * FR-CONTENT-011: Build structured learning paths with content sequencing
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

const pathSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.coerce.number().min(1, 'Estimated hours must be at least 1'),
  targetAudience: z.string().optional(),
  tags: z.string().optional(),
  isAdaptive: z.boolean(),
  certificateOnCompletion: z.boolean(),
});

type PathForm = z.infer<typeof pathSchema>;

interface PathStep {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  duration: string;
  isRequired: boolean;
  hasPrerequisite: boolean;
}

export default function CreateLearningPathPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pathSteps, setPathSteps] = useState<PathStep[]>([]);
  const [selectedContentId, setSelectedContentId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<PathForm>({
    resolver: formResolver(pathSchema),
    defaultValues: {
      difficulty: 'INTERMEDIATE',
      isAdaptive: false,
      certificateOnCompletion: true,
    },
  });

  const isAdaptive = watch('isAdaptive');

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => [
      { id: 'sub1', name: 'Mathematics', code: 'MATH' },
      { id: 'sub2', name: 'Physics', code: 'PHY' },
      { id: 'sub3', name: 'Chemistry', code: 'CHEM' },
      { id: 'sub4', name: 'English', code: 'ENG' },
      { id: 'sub5', name: 'Biology', code: 'BIO' },
    ],
  });

  const { data: contentLibrary } = useQuery({
    queryKey: ['content-library'],
    queryFn: async () => [
      { id: 'c1', title: 'Introduction to Algebra', type: 'VIDEO', duration: '45 min' },
      { id: 'c2', title: 'Linear Equations Practice', type: 'QUIZ', duration: '20 min' },
      { id: 'c3', title: 'Quadratic Equations Notes', type: 'DOCUMENT', duration: '15 pages' },
      { id: 'c4', title: 'Polynomial Functions Lab', type: 'LAB', duration: '60 min' },
      { id: 'c5', title: 'Board Exam Mock Test', type: 'QUIZ', duration: '180 min' },
    ],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PathForm & { steps: PathStep[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: 'lp-new', ...data };
    },
    onSuccess: () => {
      toast.success('Learning path created successfully!');
      router.push('/learning-paths');
    },
    onError: () => toast.error('Failed to create learning path.'),
  });

  const addStep = () => {
    const content = contentLibrary?.find((c) => c.id === selectedContentId);
    if (!content) {
      toast.error('Please select content to add');
      return;
    }
    if (pathSteps.some((s) => s.contentId === content.id)) {
      toast.error('Content already added to path');
      return;
    }
    setPathSteps([
      ...pathSteps,
      {
        id: `step-${Date.now()}`,
        contentId: content.id,
        contentTitle: content.title,
        contentType: content.type,
        duration: content.duration,
        isRequired: true,
        hasPrerequisite: pathSteps.length > 0,
      },
    ]);
    setSelectedContentId('');
  };

  const removeStep = (stepId: string) => {
    setPathSteps(pathSteps.filter((s) => s.id !== stepId));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...pathSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setPathSteps(newSteps);
  };

  const onSubmit = (data: PathForm) => {
    if (pathSteps.length === 0) {
      toast.error('Add at least one content step to the path');
      return;
    }
    createMutation.mutate({ ...data, steps: pathSteps });
  };

  const nextStep = async () => {
    const fields: (keyof PathForm)[] =
      step === 1 ? ['title', 'description', 'subjectId', 'grade', 'difficulty', 'estimatedHours'] : [];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (step === 2 && pathSteps.length === 0) {
      toast.error('Add at least one content step');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create Learning Path</h1>
        <p className="mt-2 text-sm text-gray-600">
          Build a structured learning journey with sequenced content and prerequisites
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            <span className={`ml-2 text-sm ${step >= s ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Content Sequence' : 'Review'}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Can permission={PERMISSIONS.CONTENT_CREATE}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Path Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <Input {...register('title')} placeholder="e.g., Complete Mathematics Mastery" />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <Textarea {...register('description')} rows={3} placeholder="Describe the learning path goals..." />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <Select {...register('subjectId')}>
                      <option value="">Select subject</option>
                      {subjectsData?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                    {errors.subjectId && <p className="text-red-500 text-sm mt-1">{errors.subjectId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <Select {...register('grade')}>
                      <option value="">Select grade</option>
                      {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                    {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                    <Select {...register('difficulty')}>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours *</label>
                    <Input type="number" {...register('estimatedHours')} min={1} />
                    {errors.estimatedHours && <p className="text-red-500 text-sm mt-1">{errors.estimatedHours.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <Input {...register('tags')} placeholder="CBSE, Board Exam, Algebra" />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('isAdaptive')} className="rounded" />
                    <span className="text-sm text-gray-700">Enable adaptive path (adjust based on performance)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('certificateOnCompletion')} className="rounded" />
                    <span className="text-sm text-gray-700">Certificate on completion</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Sequence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedContentId} onChange={(e) => setSelectedContentId(e.target.value)} className="flex-1">
                    <option value="">Select content to add...</option>
                    {contentLibrary?.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                    ))}
                  </Select>
                  <Button type="button" onClick={addStep}>Add Step</Button>
                </div>

                {pathSteps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    Add content items to build your learning path sequence
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pathSteps.map((pathStep, index) => (
                      <div key={pathStep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{pathStep.contentTitle}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{pathStep.contentType}</Badge>
                            <span className="text-sm text-gray-500">{pathStep.duration}</span>
                            {pathStep.hasPrerequisite && (
                              <Badge variant="warning">Requires previous step</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button type="button" variant="outline" size="sm" onClick={() => moveStep(index, 'up')} disabled={index === 0}>↑</Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => moveStep(index, 'down')} disabled={index === pathSteps.length - 1}>↓</Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeStep(pathStep.id)}>✕</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Content is locked until the previous step is completed. {isAdaptive && 'Adaptive mode will suggest alternate content based on quiz performance.'}
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Title:</strong> {watch('title')}</p>
                  <p><strong>Subject:</strong> {subjectsData?.find((s) => s.id === watch('subjectId'))?.name}</p>
                  <p><strong>Grade:</strong> {watch('grade')}</p>
                  <p><strong>Difficulty:</strong> {watch('difficulty')}</p>
                  <p><strong>Estimated Hours:</strong> {watch('estimatedHours')}h</p>
                  <p><strong>Steps:</strong> {pathSteps.length} content items</p>
                  {watch('isAdaptive') && <Badge variant="info">Adaptive Path Enabled</Badge>}
                  {watch('certificateOnCompletion') && <Badge variant="success">Certificate on Completion</Badge>}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content Sequence Preview</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {pathSteps.map((s) => (
                      <li key={s.id}>{s.contentTitle} ({s.contentType})</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : router.back())}>
              {step > 1 ? 'Previous' : 'Cancel'}
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>Next</Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Learning Path'}
              </Button>
            )}
          </div>
        </form>
      </Can>
    </div>
  );
}
