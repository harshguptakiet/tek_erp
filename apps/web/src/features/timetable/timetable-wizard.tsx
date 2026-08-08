'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle } from 'lucide-react';
import { useCreateTimetable, useAutoGenerateTimetable } from './use-timetable';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const timetableSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
  academicYearId: z.string().min(1, 'Academic year is required'),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  autoGenerate: z.boolean().default(false),
});

type TimetableFormData = z.infer<typeof timetableSchema>;

interface TimetableWizardProps {
  classes?: Array<{ id: string; name: string }>;
  sections?: Array<{ id: string; name: string }>;
  academicYears?: Array<{ id: string; name: string }>;
}

const steps = [
  { id: 1, name: 'Basic Info', description: 'Timetable details' },
  { id: 2, name: 'Configuration', description: 'Setup preferences' },
  { id: 3, name: 'Generate', description: 'Create timetable' },
];

export function TimetableWizard({
  classes = [],
  sections = [],
  academicYears = [],
}: TimetableWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [effectiveFrom, setEffectiveFrom] = useState<Date>();
  const [effectiveTo, setEffectiveTo] = useState<Date>();
  const [autoGenerate, setAutoGenerate] = useState(false);

  const createTimetable = useCreateTimetable();
  const autoGenerateTimetable = useAutoGenerateTimetable();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      autoGenerate: false,
    },
  });

  const selectedClass = watch('classId');

  const onSubmit = async (data: TimetableFormData) => {
    try {
      const submitData = {
        ...data,
        effectiveFrom: effectiveFrom!.toISOString(),
        effectiveTo: effectiveTo?.toISOString(),
        schoolId: 'current-school-id', // Get from auth context
      };

      if (autoGenerate) {
        await autoGenerateTimetable.mutateAsync({
          ...submitData,
          constraints: {
            minPeriodsPerDay: 5,
            maxPeriodsPerDay: 8,
          },
        });
        toast.success('Timetable auto-generated successfully!');
      } else {
        const result = await createTimetable.mutateAsync(submitData);
        toast.success('Timetable created successfully!');
        router.push(`/timetable/${result.id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to create timetable');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Timetable Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Class 10-A Timetable 2024"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue('classId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && (
                    <p className="text-sm text-red-500">{errors.classId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <Select onValueChange={(value) => setValue('sectionId', value)}>
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
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <Select onValueChange={(value) => setValue('academicYearId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearId && (
                  <p className="text-sm text-red-500">{errors.academicYearId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Effective From <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    date={effectiveFrom}
                    onDateChange={(date) => {
                      setEffectiveFrom(date);
                      setValue('effectiveFrom', date!);
                    }}
                    placeholder="Select start date"
                  />
                  {errors.effectiveFrom && (
                    <p className="text-sm text-red-500">{errors.effectiveFrom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Effective To</label>
                  <DatePicker
                    date={effectiveTo}
                    onDateChange={(date) => {
                      setEffectiveTo(date);
                      setValue('effectiveTo', date);
                    }}
                    placeholder="Select end date (optional)"
                    fromDate={effectiveFrom}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="autoGenerate"
                  checked={autoGenerate}
                  onChange={(e) => {
                    setAutoGenerate(e.target.checked);
                    setValue('autoGenerate', e.target.checked);
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="autoGenerate" className="font-medium cursor-pointer">
                    Auto-generate timetable
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically create a timetable based on available teachers, subjects, and rooms.
                    You can edit it later.
                  </p>
                </div>
              </div>

              {autoGenerate && (
                <div className="space-y-4 pl-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Periods Per Day</label>
                      <Input type="number" min="1" max="10" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Periods Per Day</label>
                      <Input type="number" min="1" max="10" defaultValue="8" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Constraints</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="avoid-consecutive" />
                        <label htmlFor="avoid-consecutive" className="text-sm">
                          Avoid consecutive periods for same subject
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="teacher-prefs" />
                        <label htmlFor="teacher-prefs" className="text-sm">
                          Consider teacher preferences
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Review & Generate */}
        {currentStep === 3 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Review & Generate</h2>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{watch('name')}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">
                    {classes.find((c) => c.id === selectedClass)?.name || '-'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective From:</span>
                  <span className="font-medium">
                    {effectiveFrom?.toLocaleDateString() || '-'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-generate:</span>
                  <Badge variant={autoGenerate ? 'success' : 'secondary'}>
                    {autoGenerate ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  {autoGenerate
                    ? 'The system will automatically generate a timetable based on your configuration. You can review and edit it after creation.'
                    : 'An empty timetable will be created. You can manually add periods later.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Timetable'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
