'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: Partial<TeacherFormData>;
  onSubmit: (data: TeacherFormData) => void;
  isSubmitting?: boolean;
}

export function TeacherForm({ initialData, onSubmit, isSubmitting }: TeacherFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData || {
      subjects: [],
      experience: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                {...register('firstName')}
                placeholder="Enter first name"
                error={errors.firstName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                {...register('lastName')}
                placeholder="Enter last name"
                error={errors.lastName?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="teacher@school.com"
                error={errors.email?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                {...register('phone')}
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Textarea
              {...register('address')}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact
            </label>
            <Input
              {...register('emergencyContact')}
              placeholder="Emergency contact number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
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
              <Input
                {...register('employeeId')}
                placeholder="EMP001"
                error={errors.employeeId?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <Input
                {...register('joiningDate')}
                type="date"
                error={errors.joiningDate?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <Select
                {...register('department')}
                error={errors.department?.message}
              >
                <option value="">Select department</option>
                <option value="MATHEMATICS">Mathematics</option>
                <option value="SCIENCE">Science</option>
                <option value="ENGLISH">English</option>
                <option value="SOCIAL_STUDIES">Social Studies</option>
                <option value="LANGUAGES">Languages</option>
                <option value="ARTS">Arts</option>
                <option value="PHYSICAL_EDUCATION">Physical Education</option>
                <option value="COMPUTER_SCIENCE">Computer Science</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <Input
                {...register('experience', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                error={errors.experience?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification *
            </label>
            <Input
              {...register('qualification')}
              placeholder="e.g., M.Ed., B.Ed., M.Sc."
              error={errors.qualification?.message}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Teacher' : 'Create Teacher'}
        </Button>
      </div>
    </form>
  );
}
