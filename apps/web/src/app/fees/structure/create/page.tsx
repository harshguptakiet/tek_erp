/**
 * Module 07: Finance - Create Fee Structure
 * FR-FEE-001: Define fee structures with components
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { feeService } from '@/services/fee.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const feeStructureSchema = z.object({
  name: z.string().min(3, 'Structure name must be at least 3 characters'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  classId: z.string().min(1, 'Class is required'),
  components: z.array(
    z.object({
      name: z.string().min(1, 'Component name is required'),
      amount: z.number().min(0, 'Amount must be positive'),
      isOptional: z.boolean().default(false),
    })
  ).min(1, 'At least one fee component is required'),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

const DEFAULT_COMPONENTS = [
  { name: 'Tuition Fee', amount: 0, isOptional: false },
  { name: 'Admission Fee', amount: 0, isOptional: false },
  { name: 'Library Fee', amount: 0, isOptional: true },
  { name: 'Sports Fee', amount: 0, isOptional: true },
  { name: 'Lab Fee', amount: 0, isOptional: true },
  { name: 'Computer Fee', amount: 0, isOptional: true },
  { name: 'Transport Fee', amount: 0, isOptional: true },
  { name: 'Hostel Fee', amount: 0, isOptional: true },
  { name: 'Examination Fee', amount: 0, isOptional: false },
  { name: 'Development Fee', amount: 0, isOptional: true },
];

export default function CreateFeeStructurePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      name: '',
      academicYearId: '',
      classId: '',
      components: [{ name: '', amount: 0, isOptional: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'components',
  });

  // Real API integration
  const { data: academicYearsResponse } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const academicYears = Array.isArray(academicYearsResponse)
    ? academicYearsResponse
    : academicYearsResponse?.data || [];
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];

  // Create fee structure mutation
  const createMutation = useMutation({
    mutationFn: (data: FeeStructureFormData) =>
      feeService.createFeeStructure({
        schoolId: user?.schoolId || '',
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure created successfully!');
      router.push('/fees');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create fee structure');
    },
  });

  const onSubmit = (data: FeeStructureFormData) => {
    // Filter out empty components
    const filteredComponents = data.components.filter(
      (c) => c.name.trim() !== '' && c.amount > 0
    );

    if (filteredComponents.length === 0) {
      toast.error('Please add at least one fee component with valid amount');
      return;
    }

    createMutation.mutate({
      ...data,
      components: filteredComponents,
    });
  };

  const addDefaultComponent = (component: typeof DEFAULT_COMPONENTS[0]) => {
    append(component);
  };

  const watchedComponents = watch('components');
  const totalAmount = watchedComponents.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const mandatoryAmount = watchedComponents
    .filter((c) => !c.isOptional)
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/fees')}>
            ← Back to Fees
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create Fee Structure</h1>
        <p className="mt-2 text-sm text-gray-600">
          Define fee components and amounts for a specific class and academic year
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Structure Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Class 10 Annual Fee 2024-25"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <Select {...register('academicYearId')}>
                  <option value="">Select academic year...</option>
                  {academicYears.map((year: any) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
                {errors.academicYearId && (
                  <p className="text-sm text-red-600 mt-1">{errors.academicYearId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <Select {...register('classId')}>
                  <option value="">Select class...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
                {errors.classId && (
                  <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Components */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Components</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', amount: 0, isOptional: false })}
                >
                  + Add Component
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Add Common Components:</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COMPONENTS.map((comp, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDefaultComponent(comp)}
                  >
                    + {comp.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Components List */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <Input
                        {...register(`components.${index}.name`)}
                        placeholder="Component name (e.g., Tuition Fee)"
                      />
                      {errors.components?.[index]?.name && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.components[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        {...register(`components.${index}.amount`, { valueAsNumber: true })}
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                      />
                      {errors.components?.[index]?.amount && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.components[index]?.amount?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox {...register(`components.${index}.isOptional`)} />
                        <span className="text-sm text-gray-700">Optional</span>
                      </label>
                    </div>
                  </div>
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
              ))}
            </div>

            {errors.components && (
              <p className="text-sm text-red-600">{errors.components.message}</p>
            )}

            {/* Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Total Components:</span>
                  <span className="ml-2 font-semibold">{fields.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mandatory Amount:</span>
                  <span className="ml-2 font-semibold text-orange-600">
                    ₹{mandatoryAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-bold text-blue-600 text-lg">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b font-medium">
                  <span>Component</span>
                  <span>Amount</span>
                </div>
                {watchedComponents
                  .filter((c) => c.name.trim() !== '' && c.amount > 0)
                  .map((comp, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{comp.name}</span>
                        {comp.isOptional && (
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">₹{comp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                <div className="flex items-center justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
                  <span>Total Fee</span>
                  <span className="text-blue-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/fees')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Fee Structure'}
          </Button>
        </div>
      </form>
    </div>
  );
}
