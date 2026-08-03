/**
 * Module 07: Finance - Create Fee Structure
 * FR-FEE-001: Define fee structure with components and discounts
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
const feeStructureSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.enum(['ANNUAL', 'TERM_1', 'TERM_2', 'TERM_3', 'MONTHLY']),
  applicableClasses: z.array(z.string()).min(1, 'Select at least one class'),
  dueDate: z.string().min(1, 'Due date is required'),
  components: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().min(0),
    isMandatory: z.boolean(),
    description: z.string().optional(),
  })).min(1, 'At least one fee component is required'),
  discounts: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().min(0),
    conditions: z.string().optional(),
  })),
  lateFee: z.object({
    enabled: z.boolean(),
    amount: z.number().min(0),
    gracePeriodDays: z.number().min(0),
  }),
  installments: z.object({
    allowed: z.boolean(),
    count: z.number().min(1).max(12),
  }),
  description: z.string().optional(),
});

type FeeStructureForm = z.infer<typeof feeStructureSchema>;

export default function CreateFeeStructurePage() {
  const router = useRouter();
  const [components, setComponents] = useState([
    { name: 'Tuition Fee', amount: 50000, isMandatory: true, description: '' },
    { name: 'Library Fee', amount: 2000, isMandatory: true, description: '' },
    { name: 'Lab Fee', amount: 3000, isMandatory: true, description: '' },
  ]);
  const [discounts, setDiscounts] = useState([
    { name: 'Sibling Discount', type: 'PERCENTAGE' as const, value: 10, conditions: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FeeStructureForm>({
    resolver: formResolver(feeStructureSchema),
    defaultValues: {
      academicYear: '2024-2025',
      term: 'ANNUAL',
      components: components,
      discounts: discounts,
      applicableClasses: [],
      lateFee: {
        enabled: false,
        amount: 500,
        gracePeriodDays: 7,
      },
      installments: {
        allowed: false,
        count: 3,
      },
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

  const createMutation = useMutation({
    mutationFn: async (data: FeeStructureForm) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-fee-structure-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Fee structure created successfully');
      router.push(`/fees/structure/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create fee structure');
    },
  });

  const addComponent = () => {
    const newComponent = {
      name: '',
      amount: 0,
      isMandatory: true,
      description: '',
    };
    setComponents([...components, newComponent]);
    setValue('components', [...components, newComponent]);
  };

  const removeComponent = (index: number) => {
    if (components.length > 1) {
      const newComponents = components.filter((_, i) => i !== index);
      setComponents(newComponents);
      setValue('components', newComponents);
    }
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
    setValue('components', newComponents);
  };

  const addDiscount = () => {
    const newDiscount = {
      name: '',
      type: 'PERCENTAGE' as const,
      value: 0,
      conditions: '',
    };
    setDiscounts([...discounts, newDiscount]);
    setValue('discounts', [...discounts, newDiscount]);
  };

  const removeDiscount = (index: number) => {
    const newDiscounts = discounts.filter((_, i) => i !== index);
    setDiscounts(newDiscounts);
    setValue('discounts', newDiscounts);
  };

  const updateDiscount = (index: number, field: string, value: any) => {
    const newDiscounts = [...discounts];
    newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    setDiscounts(newDiscounts);
    setValue('discounts', newDiscounts);
  };

  const selectedClasses = watch('applicableClasses') || [];

  const toggleClass = (classId: string) => {
    const updated = selectedClasses.includes(classId)
      ? selectedClasses.filter((id) => id !== classId)
      : [...selectedClasses, classId];
    setValue('applicableClasses', updated);
  };

  const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);
  const mandatoryAmount = components
    .filter((c) => c.isMandatory)
    .reduce((sum, c) => sum + c.amount, 0);

  const onSubmit = (data: FeeStructureForm) => {
    createMutation.mutate(data);
  };


  return (
    <Can
      permission={PERMISSIONS.FEE_CREATE}
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create fee structures</p>
            <Button className="mt-4" onClick={() => router.push('/fees')}>
              Back to Fees
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/fees')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Fee Structure</h1>
          <p className="mt-2 text-sm text-gray-600">
            Define fee components, discounts, and payment terms
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Structure Name *
                  </label>
                  <Input {...register('name')} placeholder="e.g., Annual Fee 2024-2025" />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
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
                    Term/Frequency *
                  </label>
                  <Select {...register('term')}>
                    <option value="ANNUAL">Annual</option>
                    <option value="TERM_1">Term 1</option>
                    <option value="TERM_2">Term 2</option>
                    <option value="TERM_3">Term 3</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <Input type="date" {...register('dueDate')} />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Applicable Classes */}
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
                    <p className="font-semibold text-gray-900">{cls.name}</p>
                    {selectedClasses.includes(cls.id) && (
                      <Badge variant="success" className="mt-2 text-xs">✓ Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
              {errors.applicableClasses && (
                <p className="text-sm text-red-600 mt-2">{errors.applicableClasses.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Fee Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fee Components *</CardTitle>
                <Button type="button" onClick={addComponent} size="sm">
                  + Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {components.map((component, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 relative">
                  {components.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Component Name *
                      </label>
                      <Input
                        value={component.name}
                        onChange={(e) => updateComponent(index, 'name', e.target.value)}
                        placeholder="e.g., Tuition Fee"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹) *
                      </label>
                      <Input
                        type="number"
                        value={component.amount}
                        onChange={(e) => updateComponent(index, 'amount', parseFloat(e.target.value))}
                        min="0"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={component.isMandatory}
                          onChange={(e) => updateComponent(index, 'isMandatory', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Mandatory</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Input
                      value={component.description}
                      onChange={(e) => updateComponent(index, 'description', e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              ))}

              {errors.components && (
                <p className="text-sm text-red-600">{errors.components.message}</p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-900">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-blue-800">Mandatory Amount:</span>
                  <span className="text-sm font-medium text-blue-800">
                    ₹{mandatoryAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Discounts (Optional)</CardTitle>
                <Button type="button" onClick={addDiscount} size="sm" variant="outline">
                  + Add Discount
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {discounts.length === 0 ? (
                <p className="text-center text-gray-600 py-4">No discounts defined</p>
              ) : (
                discounts.map((discount, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => removeDiscount(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Name *
                        </label>
                        <Input
                          value={discount.name}
                          onChange={(e) => updateDiscount(index, 'name', e.target.value)}
                          placeholder="e.g., Sibling"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <Select
                          value={discount.type}
                          onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                        >
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED">Fixed Amount</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value *
                        </label>
                        <Input
                          type="number"
                          value={discount.value}
                          onChange={(e) => updateDiscount(index, 'value', parseFloat(e.target.value))}
                          min="0"
                          placeholder={discount.type === 'PERCENTAGE' ? '%' : '₹'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Conditions
                        </label>
                        <Input
                          value={discount.conditions}
                          onChange={(e) => updateDiscount(index, 'conditions', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Late Fee & Installments */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Late Fee */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    {...register('lateFee.enabled')}
                    className="rounded"
                  />
                  <label className="font-medium text-gray-900">Enable Late Fee</label>
                </div>

                {watch('lateFee.enabled') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Late Fee Amount (₹)
                      </label>
                      <Input
                        type="number"
                        {...register('lateFee.amount', { valueAsNumber: true })}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (Days)
                      </label>
                      <Input
                        type="number"
                        {...register('lateFee.gracePeriodDays', { valueAsNumber: true })}
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Installments */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    {...register('installments.allowed')}
                    className="rounded"
                  />
                  <label className="font-medium text-gray-900">Allow Installments</label>
                </div>

                {watch('installments.allowed') && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Installments
                    </label>
                    <Select {...register('installments.count', { valueAsNumber: true })}>
                      {[2, 3, 4, 6, 12].map((count) => (
                        <option key={count} value={count}>
                          {count} Installments
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
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
                  <span className="text-gray-600">Total Components:</span>
                  <Badge variant="info">{components.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discounts Available:</span>
                  <Badge variant="info">{discounts.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <Badge variant="success" className="text-lg">
                    ₹{totalAmount.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applicable Classes:</span>
                  <Badge variant="info">{selectedClasses.length}</Badge>
                </div>
                {watch('installments.allowed') && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Per Installment:</span>
                    <Badge variant="warning">
                      ₹{(totalAmount / watch('installments.count')).toLocaleString()}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/fees')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Fee Structure'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
