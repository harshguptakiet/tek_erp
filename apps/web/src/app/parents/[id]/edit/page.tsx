/**
 * Module 02: User Management - Parent Profile Edit Page
 * FR-USER-028: Edit parent/guardian profile information
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
const parentEditSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  alternatePhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  workPhone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  preferredCommunication: z.enum(['EMAIL', 'SMS', 'PHONE', 'APP']),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  }),
  notes: z.string().optional(),
});

type ParentEditForm = z.infer<typeof parentEditSchema>;

export default function ParentEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data - replace with actual API call
  const { data: parent, isLoading } = useQuery({
    queryKey: ['parent', params.id],
    queryFn: async () => ({
      id: params.id,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      middleName: '',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      alternatePhone: '+91 9876543211',
      gender: 'MALE' as const,
      occupation: 'Software Engineer',
      employer: 'Tech Solutions Pvt Ltd',
      workPhone: '+91 2212345678',
      address: {
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      preferredCommunication: 'APP' as const,
      emergencyContact: {
        name: 'Sunita Kumar',
        relationship: 'Spouse',
        phone: '+91 9876543212',
      },
      notes: 'Prefers evening communication after 6 PM',
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ParentEditForm>({
    resolver: zodResolver(parentEditSchema),
    defaultValues: parent,
  });

  // Reset form when data loads
  useEffect(() => {
    if (parent) {
      reset(parent);
    }
  }, [parent, reset]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateMutation = useMutation({
    mutationFn: async (data: ParentEditForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast.success('Parent profile updated successfully');
      setHasUnsavedChanges(false);
      router.push(`/parents/${params.id}`);
    },
    onError: () => {
      toast.error('Failed to update parent profile');
    },
  });

  const onSubmit = (data: ParentEditForm) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push(`/parents/${params.id}`);
      }
    } else {
      router.push(`/parents/${params.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Parent not found</p>
          <Button className="mt-4" onClick={() => router.push('/parents')}>
            Back to Parents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Can
      permission={PERMISSIONS.PARENTS_EDIT}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to edit parent profiles</p>
            <Button className="mt-4" onClick={() => router.push(`/parents/${params.id}`)}>
              Back to Profile
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Parent Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update parent/guardian information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <Input {...register('middleName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <Select {...register('gender')}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input {...register('phone')} placeholder="+91 9876543210" />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <Input {...register('alternatePhone')} placeholder="+91 9876543210" />
                  {errors.alternatePhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.alternatePhone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Communication *
                  </label>
                  <Select {...register('preferredCommunication')}>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="APP">Mobile App</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <Input {...register('occupation')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer
                  </label>
                  <Input {...register('employer')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Phone
                  </label>
                  <Input {...register('workPhone')} placeholder="+91 2212345678" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <Input {...register('address.street')} />
                {errors.address?.street && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input {...register('address.city')} />
                  {errors.address?.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input {...register('address.state')} />
                  {errors.address?.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <Input {...register('address.country')} />
                  {errors.address?.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.country.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <Input {...register('address.postalCode')} />
                  {errors.address?.postalCode && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input {...register('emergencyContact.name')} />
                  {errors.emergencyContact?.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <Input {...register('emergencyContact.relationship')} placeholder="Spouse, Sibling, etc." />
                  {errors.emergencyContact?.relationship && (
                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input {...register('emergencyContact.phone')} placeholder="+91 9876543210" />
                  {errors.emergencyContact?.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('notes')}
                placeholder="Any additional information or special instructions..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
