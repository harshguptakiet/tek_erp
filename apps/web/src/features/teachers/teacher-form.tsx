'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCreateTeacher, useUpdateTeacher } from './use-teachers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const teacherSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  dateOfBirth: z.date().optional(),
  dateOfJoining: z.date(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().optional(),
  address: z.string().optional(),
  schoolId: z.string().min(1, 'School is required'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: Partial<TeacherFormData> & { id?: string };
  schoolId: string;
}

export function TeacherForm({ initialData, schoolId }: TeacherFormProps) {
  const router = useRouter();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );
  const [dateOfJoining, setDateOfJoining] = useState<Date | undefined>(
    initialData?.dateOfJoining ? new Date(initialData.dateOfJoining) : new Date()
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      ...initialData,
      schoolId,
      dateOfJoining: dateOfJoining,
    },
  });

  const onSubmit = async (data: TeacherFormData) => {
    try {
      const submitData = {
        ...data,
        dateOfBirth: dateOfBirth?.toISOString(),
        dateOfJoining: dateOfJoining!.toISOString(),
      };

      if (initialData?.id) {
        await updateTeacher.mutateAsync({
          id: initialData.id,
          data: submitData,
        });
      } else {
        await createTeacher.mutateAsync(submitData);
      }
      
      router.push('/teachers');
    } catch (error) {
      console.error('Failed to save teacher:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('employeeId')}
              placeholder="EMP001"
              disabled={!!initialData?.id}
            />
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="teacher@school.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input {...register('firstName')} placeholder="John" />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input {...register('lastName')} placeholder="Doe" />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('phone')}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <DatePicker
              date={dateOfBirth}
              onDateChange={(date) => {
                setDateOfBirth(date);
                setValue('dateOfBirth', date);
              }}
              placeholder="Select date of birth"
              toDate={new Date()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Date of Joining <span className="text-red-500">*</span>
            </label>
            <DatePicker
              date={dateOfJoining}
              onDateChange={(date) => {
                setDateOfJoining(date);
                setValue('dateOfJoining', date!);
              }}
              placeholder="Select joining date"
            />
            {errors.dateOfJoining && (
              <p className="text-sm text-red-500">{errors.dateOfJoining.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Qualification</label>
            <Input
              {...register('qualification')}
              placeholder="B.Ed, M.Ed, PhD"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Specialization</label>
            <Input
              {...register('specialization')}
              placeholder="Mathematics, Science, etc."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Experience (Years)</label>
            <Input
              {...register('experience', { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="5"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Textarea
            {...register('address')}
            placeholder="Enter full address"
            rows={3}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : initialData?.id
            ? 'Update Teacher'
            : 'Create Teacher'}
        </Button>
      </div>
    </form>
  );
}
