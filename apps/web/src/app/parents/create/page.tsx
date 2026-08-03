/**
 * Module 02: User Management - Parent/Guardian Registration
 * FR-USER-027: Create new parent/guardian profile
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
const parentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number (E.164 format)'),
  alternatePhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER']),
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
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  }),
  preferredCommunication: z.enum(['EMAIL', 'SMS', 'PHONE', 'APP']),
  studentIds: z.array(z.string()).min(1, 'At least one student must be linked'),
  isPrimaryContact: z.boolean(),
  notes: z.string().optional(),
});

type ParentForm = z.infer<typeof parentSchema>;

export default function CreateParentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ParentForm>({
    resolver: formResolver(parentSchema),
    defaultValues: {
      gender: 'PREFER_NOT_TO_SAY',
      relationship: 'FATHER',
      preferredCommunication: 'APP',
      isPrimaryContact: true,
      studentIds: [],
      address: {
        country: 'India',
      },
    },
  });

  const relationship = watch('relationship');
  const selectedStudents = watch('studentIds');

  // Mock students data - replace with actual query
  const availableStudents = [
    { id: '1', name: 'Aarav Kumar', class: 'Class 10', section: 'A', admissionNumber: 'ADM2024001' },
    { id: '2', name: 'Diya Sharma', class: 'Class 9', section: 'B', admissionNumber: 'ADM2024002' },
    { id: '3', name: 'Rohan Patel', class: 'Class 11', section: 'A', admissionNumber: 'ADM2024003' },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: ParentForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-parent-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Parent profile created successfully');
      router.push(`/parents/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create parent profile');
    },
  });

  const onSubmit = (data: ParentForm) => {
    createMutation.mutate(data);
  };

  const toggleStudent = (studentId: string) => {
    const current = selectedStudents || [];
    if (current.includes(studentId)) {
      setValue('studentIds', current.filter(id => id !== studentId));
    } else {
      setValue('studentIds', [...current, studentId]);
    }
  };

  return (
    <Can
      permission={PERMISSIONS.PARENTS_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create parent profiles</p>
            <Button className="mt-4" onClick={() => router.push('/parents')}>
              Back to Parents
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/parents')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Parent/Guardian</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new parent or guardian profile
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Personal Info' },
              { num: 2, title: 'Contact & Address' },
              { num: 3, title: 'Link Students' },
            ].map((s, idx) => (
              <div key={s.num} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s.num ? 'bg-green-600' : 'bg-gray-200'
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
          {/* Step 1: Personal Information */}
          {step === 1 && (
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship to Student *
                    </label>
                    <Select {...register('relationship')}>
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="GUARDIAN">Legal Guardian</option>
                      <option value="GRANDPARENT">Grandparent</option>
                      <option value="SIBLING">Sibling</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <Input {...register('occupation')} placeholder="e.g., Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employer
                    </label>
                    <Input {...register('employer')} placeholder="Company name" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Phone
                  </label>
                  <Input {...register('workPhone')} placeholder="+91 22 12345678" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact & Address */}
          {step === 2 && (
            <>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <Input {...register('alternatePhone')} placeholder="+91 9876543211" />
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input {...register('emergencyContact.phone')} placeholder="+91 9876543212" />
                      {errors.emergencyContact?.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.phone.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Link Students */}
          {step === 3 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Link Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select one or more students to link with this parent/guardian profile
                  </p>

                  <div className="space-y-2">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedStudents.includes(student.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">
                              {student.class} - Section {student.section} • {student.admissionNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.studentIds && (
                    <p className="text-sm text-red-600">{errors.studentIds.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimaryContact"
                      {...register('isPrimaryContact')}
                      className="rounded"
                    />
                    <label htmlFor="isPrimaryContact" className="text-sm font-medium text-gray-700">
                      Set as primary contact for linked students
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <Textarea
                      {...register('notes')}
                      placeholder="Any additional information or special instructions..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/parents')}
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Parent Profile'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Can>
  );
}
