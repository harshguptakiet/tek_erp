'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.number().min(1).max(12, 'Grade must be between 1 and 12'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  sections: z.array(
    z.object({
      name: z.string().min(1, 'Section name is required'),
      capacity: z.number().min(1, 'Capacity is required'),
      classTeacherId: z.string().optional(),
    })
  ).min(1, 'At least one section is required'),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: Partial<ClassFormData>;
  onSubmit: (data: ClassFormData) => void;
  isSubmitting?: boolean;
  academicYears?: Array<{ id: string; name: string }>;
  teachers?: Array<{ id: string; name: string }>;
}

export function ClassForm({
  initialData,
  onSubmit,
  isSubmitting,
  academicYears = [],
  teachers = [],
}: ClassFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData || {
      sections: [{ name: 'A', capacity: 40 }],
      capacity: 40,
      grade: 1,
    },
  });

  const sections = watch('sections') || [];

  const addSection = () => {
    const newSections = [
      ...sections,
      { name: String.fromCharCode(65 + sections.length), capacity: 40 },
    ];
    setValue('sections', newSections);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setValue('sections', newSections);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Class 10, Grade 5"
                error={errors.name?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level *
              </label>
              <Input
                {...register('grade', { valueAsNumber: true })}
                type="number"
                min="1"
                max="12"
                placeholder="1-12"
                error={errors.grade?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year *
              </label>
              <Select
                {...register('academicYearId')}
                error={errors.academicYearId?.message}
              >
                <option value="">Select academic year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Capacity *
              </label>
              <Input
                {...register('capacity', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="40"
                error={errors.capacity?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sections</CardTitle>
            <Button type="button" size="sm" onClick={addSection}>
              + Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Section {index + 1}</h4>
                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Name *
                  </label>
                  <Input
                    {...register(`sections.${index}.name` as const)}
                    placeholder="A, B, C..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <Input
                    {...register(`sections.${index}.capacity` as const, { valueAsNumber: true })}
                    type="number"
                    min="1"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher
                  </label>
                  <Select {...register(`sections.${index}.classTeacherId` as const)}>
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          ))}
          {errors.sections && (
            <p className="text-sm text-red-600">{errors.sections.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  );
}
