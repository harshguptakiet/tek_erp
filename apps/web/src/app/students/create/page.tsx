/**
 * Module 02: User Management - Create Student
 * FR-USER-011: Student enrollment and profile creation
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
import { studentService } from '@/services/student.service';
import { academicService } from '@/services/academic.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';

// Validation schema
const studentSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  nationality: z.string().default('Indian'),
  religion: z.string().optional(),
  caste: z.string().optional(),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS']).optional(),
  
  // Contact Information
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  
  // Academic Information
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  classId: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  rollNumber: z.string().optional(),
  
  // Parent/Guardian Information
  parentId: z.string().optional(),
  guardianName: z.string().min(2, 'Guardian name is required'),
  guardianRelation: z.string().min(2, 'Relation is required'),
  guardianPhone: z.string().min(10, 'Guardian phone is required'),
  guardianEmail: z.string().email().optional(),
  guardianOccupation: z.string().optional(),
  
  // Health Information
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),
  
  // Other
  previousSchool: z.string().optional(),
  transportRequired: z.boolean().default(false),
  hostelRequired: z.boolean().default(false),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function CreateStudentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StudentForm>({
    resolver: formResolver(studentSchema),
    defaultValues: {
      admissionNumber: `ADM${Date.now().toString().slice(-6)}`,
      admissionDate: new Date().toISOString().split('T')[0],
      nationality: 'Indian',
      transportRequired: false,
      hostelRequired: false,
    },
  });

  // Real API integration
  const { data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const { data: parentsResponse } = useQuery({
    queryKey: ['parents', user?.schoolId],
    queryFn: () => userService.listParents(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const classesData = Array.isArray(classesResponse) ? classesResponse : classesResponse?.classes || [];
  const parentsData = Array.isArray(parentsResponse) ? parentsResponse : parentsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: StudentForm) => studentService.createStudent(user?.schoolId || '', data),
    onSuccess: (data) => {
      toast.success('Student enrolled successfully');
      router.push(`/students/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to enroll student');
    },
  });

  const onSubmit = (data: StudentForm) => {
    createMutation.mutate(data);
  };

  const selectedClass = watch('classId');
  const selectedClassData = classesData?.find((c: any) => c.id === selectedClass);

  const steps = [
    { id: 1, title: 'Personal Info', description: 'Basic student details' },
    { id: 2, title: 'Contact & Address', description: 'Location and contact' },
    { id: 3, title: 'Academic Details', description: 'Class and admission' },
    { id: 4, title: 'Parent/Guardian', description: 'Family information' },
    { id: 5, title: 'Health & Other', description: 'Medical and additional info' },
  ];


  return (
    <Can
      permission={PERMISSIONS.STUDENTS_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create students</p>
            <Button className="mt-4" onClick={() => router.push('/students')}>
              Back to Students
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/students')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Enroll New Student</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete all required information to enroll a new student
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}
                  >
                    {step.id}
                  </div>
                  <p className="text-xs mt-2 text-gray-600 text-center max-w-20">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
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
                    <Input {...register('firstName')} placeholder="Aarav" />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <Input {...register('middleName')} placeholder="Kumar" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input {...register('lastName')} placeholder="Sharma" />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Gender *
                    </label>
                    <Select {...register('gender')}>
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <Select {...register('bloodGroup')}>
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <Input {...register('nationality')} placeholder="Indian" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Religion
                    </label>
                    <Input {...register('religion')} placeholder="Optional" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caste
                    </label>
                    <Input {...register('caste')} placeholder="Optional" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Select {...register('category')}>
                      <option value="">Select Category</option>
                      <option value="GENERAL">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact & Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input type="email" {...register('email')} placeholder="student@example.com" />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input {...register('phone')} placeholder="9876543210" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Textarea
                    {...register('address')}
                    placeholder="House/Flat No, Street, Landmark"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input {...register('city')} placeholder="Mumbai" />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <Input {...register('state')} placeholder="Maharashtra" />
                    {errors.state && (
                      <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <Input {...register('pincode')} placeholder="400001" />
                    {errors.pincode && (
                      <p className="text-sm text-red-600 mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Academic Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Number *
                    </label>
                    <Input
                      {...register('admissionNumber')}
                      placeholder="Auto-generated"
                      className="bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated on submit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Date *
                    </label>
                    <Input type="date" {...register('admissionDate')} />
                    {errors.admissionDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.admissionDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <Select {...register('classId')}>
                      <option value="">Select Class</option>
                      {classesData?.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </Select>
                    {errors.classId && (
                      <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    <Select {...register('section')} disabled={!selectedClass}>
                      <option value="">Select Section</option>
                      {selectedClassData?.sections.map((section: string) => (
                        <option key={section} value={section}>
                          Section {section}
                        </option>
                      ))}
                    </Select>
                    {errors.section && (
                      <p className="text-sm text-red-600 mt-1">{errors.section.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number
                    </label>
                    <Input {...register('rollNumber')} placeholder="Optional" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous School
                  </label>
                  <Input {...register('previousSchool')} placeholder="If transfer student" />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('transportRequired')}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Transport Required</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('hostelRequired')}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Hostel Required</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Parent/Guardian Information */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Existing Parent (Optional)
                  </label>
                  <Select {...register('parentId')}>
                    <option value="">Create New Guardian</option>
                    {parentsData?.map((parent: any) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.phone})
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    If parent already exists in system, select from list
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Or Enter New Guardian Details:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Name *
                      </label>
                      <Input {...register('guardianName')} placeholder="Mr. Rajesh Kumar" />
                      {errors.guardianName && (
                        <p className="text-sm text-red-600 mt-1">{errors.guardianName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relation *
                      </label>
                      <Select {...register('guardianRelation')}>
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Other">Other</option>
                      </Select>
                      {errors.guardianRelation && (
                        <p className="text-sm text-red-600 mt-1">{errors.guardianRelation.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Phone *
                      </label>
                      <Input {...register('guardianPhone')} placeholder="9876543210" />
                      {errors.guardianPhone && (
                        <p className="text-sm text-red-600 mt-1">{errors.guardianPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Email
                      </label>
                      <Input type="email" {...register('guardianEmail')} placeholder="guardian@example.com" />
                      {errors.guardianEmail && (
                        <p className="text-sm text-red-600 mt-1">{errors.guardianEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian Occupation
                    </label>
                    <Input {...register('guardianOccupation')} placeholder="e.g., Business, Engineer" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Health & Other Information */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Health & Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions
                  </label>
                  <Textarea
                    {...register('medicalConditions')}
                    placeholder="Any chronic illnesses, disabilities, or medical conditions"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Information will be kept confidential and used for emergency purposes only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <Textarea
                    {...register('allergies')}
                    placeholder="Food allergies, drug allergies, or other allergies"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Number *
                  </label>
                  <Input
                    {...register('emergencyContact')}
                    placeholder="9876543210"
                    type="tel"
                  />
                  {errors.emergencyContact && (
                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Alternative contact in case primary guardian is unreachable
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-medium text-blue-900 mb-2">📋 Enrollment Summary</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>• Personal information will be verified during admission</p>
                    <p>• Documents required: Birth certificate, transfer certificate, photo</p>
                    <p>• Parent account will be created automatically</p>
                    <p>• Student ID card will be generated after approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-8"
                >
                  {createMutation.isPending ? 'Enrolling...' : 'Enroll Student'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Can>
  );
}
