/**
 * Module 02: User Management - Teacher Registration
 * FR-USER-019: Create new teacher profile
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
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

// Validation schema
const teacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  alternatePhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'TEMPORARY', 'PART_TIME']),
  subjectIds: z.array(z.string()).min(1, 'At least one subject must be selected'),
  qualifications: z.string().min(1, 'Qualifications are required'),
  experience: z.number().min(0, 'Experience must be 0 or greater'),
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
  salary: z.number().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
});

type TeacherForm = z.infer<typeof teacherSchema>;

export default function CreateTeacherPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TeacherForm>({
    resolver: formResolver(teacherSchema),
    defaultValues: {
      gender: 'PREFER_NOT_TO_SAY',
      employmentType: 'PERMANENT',
      subjectIds: [],
      experience: 0,
      address: {
        country: 'India',
      },
    },
  });

  // Real API integration
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', user?.schoolId],
    queryFn: () => academicService.getSubjects(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.subjects || [];

  const selectedSubjects = watch('subjectIds');

  const createMutation = useMutation({
    mutationFn: (data: TeacherForm) => userService.createTeacher(user?.schoolId || '', data),
      return { id: 'new-teacher-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Teacher profile created successfully');
      router.push(`/teachers/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create teacher profile');
    },
  });

  const onSubmit = (data: TeacherForm) => {
    createMutation.mutate(data);
  };

  const toggleSubject = (subjectId: string) => {
    const current = selectedSubjects || [];
    if (current.includes(subjectId)) {
      setValue('subjectIds', current.filter(id => id !== subjectId));
    } else {
      setValue('subjectIds', [...current, subjectId]);
    }
  };

  return (
    <Can
      permission={PERMISSIONS.TEACHERS_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create teacher profiles</p>
            <Button className="mt-4" onClick={() => router.push('/teachers')}>
              Back to Teachers
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/teachers')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Teacher</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new teacher profile
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Personal Info' },
              { num: 2, title: 'Employment Details' },
              { num: 3, title: 'Subjects & Qualifications' },
            ].map((s, idx) => (
              <div key={s.num} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s.num ? 'bg-purple-600' : 'bg-gray-200'
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
            <>
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
                        Email *
                      </label>
                      <Input type="email" {...register('email')} />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input {...register('phone')} placeholder="+91 9876543210" />
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        Date of Birth *
                      </label>
                      <Input type="date" {...register('dateOfBirth')} />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <Input {...register('alternatePhone')} placeholder="+91 9876543211" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <Input {...register('address.street')} />
                    {errors.address?.street && (
                      <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <Input {...register('address.postalCode')} />
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
                      <Input {...register('emergencyContact.relationship')} placeholder="Spouse, Parent, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input {...register('emergencyContact.phone')} placeholder="+91 9876543212" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Employment Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <Input {...register('employeeId')} placeholder="EMP001" />
                    {errors.employeeId && (
                      <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joining Date *
                    </label>
                    <Input type="date" {...register('joiningDate')} />
                    {errors.joiningDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.joiningDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <Input {...register('department')} placeholder="Science, Arts, etc." />
                    {errors.department && (
                      <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <Input {...register('designation')} placeholder="Senior Teacher, HOD, etc." />
                    {errors.designation && (
                      <p className="text-sm text-red-600 mt-1">{errors.designation.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type *
                    </label>
                    <Select {...register('employmentType')}>
                      <option value="PERMANENT">Permanent</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="TEMPORARY">Temporary</option>
                      <option value="PART_TIME">Part Time</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience *
                    </label>
                    <Input
                      type="number"
                      {...register('experience', { valueAsNumber: true })}
                      min="0"
                    />
                    {errors.experience && (
                      <p className="text-sm text-red-600 mt-1">{errors.experience.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary (Optional)
                    </label>
                    <Input
                      type="number"
                      {...register('salary', { valueAsNumber: true })}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Account (Optional)
                    </label>
                    <Input {...register('bankAccount')} placeholder="Account number" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Subjects & Qualifications */}
          {step === 3 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Subjects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select subjects this teacher will teach
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjectsData?.map((subject: any) => (
                      <div
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedSubjects.includes(subject.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={() => toggleSubject(subject.id)}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{subject.name}</p>
                            <p className="text-xs text-gray-600">{subject.code}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.subjectIds && (
                    <p className="text-sm text-red-600">{errors.subjectIds.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualifications & Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualifications *
                    </label>
                    <Textarea
                      {...register('qualifications')}
                      placeholder="e.g., M.Sc. Mathematics, B.Ed."
                      rows={3}
                    />
                    {errors.qualifications && (
                      <p className="text-sm text-red-600 mt-1">{errors.qualifications.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <Textarea
                      {...register('notes')}
                      placeholder="Any additional information..."
                      rows={3}
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
                onClick={() => router.push('/teachers')}
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Teacher Profile'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Can>
  );
}
