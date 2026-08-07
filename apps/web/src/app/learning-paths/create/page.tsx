/**
 * Module 39: Learning Paths - Create Learning Path
 * FR-LEARNING-003: Create new learning path with modules
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const learningPathSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  modules: z.array(
    z.object({
      title: z.string().min(3, 'Module title required'),
      description: z.string().min(10, 'Module description required'),
      duration: z.number().min(1, 'Duration must be at least 1 hour'),
      isRequired: z.boolean().default(true),
      order: z.number(),
    })
  ).min(1, 'At least one module is required'),
});

type LearningPathFormData = z.infer<typeof learningPathSchema>;

export default function CreateLearningPathPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LearningPathFormData>({
    resolver: zodResolver(learningPathSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      difficulty: 'intermediate',
      modules: [
        { title: '', description: '', duration: 1, isRequired: true, order: 1 },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'modules',
  });

  // Real API integration
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  // Create learning path mutation
  const createMutation = useMutation({
    mutationFn: (data: LearningPathFormData) =>
      academicService.createLearningPath(user?.schoolId || '', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success('Learning path created successfully!');
      router.push(`/learning-paths/${data.id || ''}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create learning path');
    },
  });

  const onSubmit = (data: LearningPathFormData) => {
    // Reorder modules based on array index
    const orderedModules = data.modules.map((module, index) => ({
      ...module,
      order: index + 1,
    }));

    createMutation.mutate({
      ...data,
      modules: orderedModules,
    });
  };

  const watchedModules = watch('modules');
  const totalDuration = watchedModules.reduce((sum, m) => sum + (Number(m.duration) || 0), 0);

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Path details and settings' },
    { number: 2, title: 'Add Modules', description: 'Create learning modules' },
    { number: 3, title: 'Review & Create', description: 'Confirm and publish' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/learning-paths')}>
          ← Back to Learning Paths
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Create Learning Path</h1>
        <p className="mt-2 text-sm text-gray-600">
          Design a personalized learning journey for your students
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.number
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <p
                  className={`text-sm font-medium mt-2 ${
                    currentStep >= step.number ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Path Title *
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Advanced Mathematics Mastery"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the learning objectives and what students will achieve..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Select {...register('subjectId')}>
                    <option value="">Select subject...</option>
                    {subjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <Select {...register('difficulty')}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setCurrentStep(2)}>
                  Next: Add Modules →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add Modules */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Learning Modules</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      title: '',
                      description: '',
                      duration: 1,
                      isRequired: true,
                      order: fields.length + 1,
                    })
                  }
                >
                  + Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">Module {index + 1}</Badge>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < fields.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Input
                        {...register(`modules.${index}.title`)}
                        placeholder="Module title"
                      />
                      {errors.modules?.[index]?.title && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.modules[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Textarea
                        {...register(`modules.${index}.description`)}
                        placeholder="Module description"
                        rows={2}
                      />
                      {errors.modules?.[index]?.description && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.modules[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Duration (hours)</label>
                        <Input
                          type="number"
                          {...register(`modules.${index}.duration`, { valueAsNumber: true })}
                          min="1"
                          placeholder="1"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <Checkbox {...register(`modules.${index}.isRequired`)} />
                        <label className="text-sm text-gray-700">Required module</label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {errors.modules && (
                <p className="text-sm text-red-600">{errors.modules.message}</p>
              )}

              <div className="border-t pt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total Duration:</span> {totalDuration} hours
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                    ← Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(3)}>
                    Next: Review →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{watch('title')}</h3>
                  <p className="text-gray-600">{watch('description')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium">
                      {subjects.find((s: any) => s.id === watch('subjectId'))?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difficulty</p>
                    <Badge
                      variant={
                        watch('difficulty') === 'beginner'
                          ? 'success'
                          : watch('difficulty') === 'intermediate'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {watch('difficulty')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Modules</p>
                    <p className="font-medium">{watchedModules.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Duration</p>
                    <p className="font-medium">{totalDuration} hours</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Modules</h4>
                  <div className="space-y-2">
                    {watchedModules.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{module.title}</p>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{module.duration}h</Badge>
                          {module.isRequired && <Badge variant="error" className="text-xs">Required</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                ← Back to Edit
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Learning Path'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
