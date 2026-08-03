/**
 * Module 04: Academic - Create Class/Section
 * FR-ACAD-001: Create new class and sections
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
const classSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  academicYear: z.string().min(1, 'Academic year is required'),
  grade: z.number().min(1).max(12),
  sections: z.array(z.object({
    name: z.string().min(1, 'Section name is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    classTeacherId: z.string().optional(),
    roomNumber: z.string().optional(),
  })).min(1, 'At least one section is required'),
  description: z.string().optional(),
});

type ClassForm = z.infer<typeof classSchema>;

export default function CreateClassPage() {
  const router = useRouter();
  const [sections, setSections] = useState([
    { name: 'A', capacity: 40, classTeacherId: '', roomNumber: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClassForm>({
    resolver: formResolver(classSchema),
    defaultValues: {
      academicYear: '2024-2025',
      grade: 10,
      sections: sections,
    },
  });

  // Mock teachers data
  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => [
      { id: 't1', name: 'Dr. Rajesh Kumar', department: 'Mathematics' },
      { id: 't2', name: 'Prof. Priya Singh', department: 'Physics' },
      { id: 't3', name: 'Ms. Anjali Sharma', department: 'Chemistry' },
      { id: 't4', name: 'Mr. Suresh Verma', department: 'English' },
    ],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClassForm) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-class-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Class created successfully');
      router.push(`/classes/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create class');
    },
  });

  const addSection = () => {
    const newSection = {
      name: String.fromCharCode(65 + sections.length), // A, B, C, etc.
      capacity: 40,
      classTeacherId: '',
      roomNumber: '',
    };
    setSections([...sections, newSection]);
    setValue('sections', [...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
      setValue('sections', newSections);
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    setValue('sections', newSections);
  };

  const onSubmit = (data: ClassForm) => {
    createMutation.mutate(data);
  };

  return (
    <Can
      permission={PERMISSIONS.CLASSES_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create classes</p>
            <Button className="mt-4" onClick={() => router.push('/classes')}>
              Back to Classes
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/classes')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Class</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up a new class with sections for the academic year
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <Input {...register('name')} placeholder="e.g., Class 10" />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level *
                  </label>
                  <Select {...register('grade', { valueAsNumber: true })}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Grade {i + 1}
                      </option>
                    ))}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Optional description about this class..."
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
                <Button type="button" onClick={addSection} size="sm">
                  + Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 relative"
                >
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Name *
                      </label>
                      <Input
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        placeholder="A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity *
                      </label>
                      <Input
                        type="number"
                        value={section.capacity}
                        onChange={(e) => updateSection(index, 'capacity', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Teacher
                      </label>
                      <Select
                        value={section.classTeacherId}
                        onChange={(e) => updateSection(index, 'classTeacherId', e.target.value)}
                      >
                        <option value="">Not Assigned</option>
                        {teachersData?.map((teacher: any) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <Input
                        value={section.roomNumber}
                        onChange={(e) => updateSection(index, 'roomNumber', e.target.value)}
                        placeholder="Room 201"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.sections && (
                <p className="text-sm text-red-600">{errors.sections.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Sections:</span>
                  <Badge variant="info">{sections.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Capacity:</span>
                  <Badge variant="info">
                    {sections.reduce((sum, s) => sum + s.capacity, 0)} students
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Assigned Teachers:</span>
                  <Badge variant="info">
                    {sections.filter((s) => s.classTeacherId).length} / {sections.length}
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
              onClick={() => router.push('/classes')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
