'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card } from '@/components/ui/card';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const studentSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  rollNumber: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Partial<StudentFormData> & { id?: string };
  classes?: Array<{ id: string; name: string }>;
  onSubmit: (data: StudentFormData) => Promise<void>;
}

export function StudentForm({ initialData, classes = [], onSubmit }: StudentFormProps) {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: StudentFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Admission Number *</label>
            <Input {...register('admissionNumber')} placeholder="ADM001" disabled={!!initialData?.id} />
            {errors.admissionNumber && <p className="text-sm text-red-500">{errors.admissionNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Roll Number</label>
            <Input {...register('rollNumber')} placeholder="001" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">First Name *</label>
            <Input {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name *</label>
            <Input {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth *</label>
            <DatePicker
              date={dateOfBirth}
              onDateChange={(date) => {
                setDateOfBirth(date);
                setValue('dateOfBirth', date!);
              }}
              placeholder="Select date"
              toDate={new Date()}
            />
            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender *</label>
            <SelectRoot onValueChange={(value: any) => setValue('gender', value)} defaultValue={initialData?.gender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...register('email')} type="email" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input {...register('phone')} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Blood Group</label>
            <Input {...register('bloodGroup')} placeholder="A+" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Class *</label>
            <SelectRoot onValueChange={(value) => setValue('classId', value)} defaultValue={initialData?.classId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            {errors.classId && <p className="text-sm text-red-500">{errors.classId.message}</p>}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Create'} Student
        </Button>
      </div>
    </form>
  );
}
