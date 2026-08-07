'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const periodSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  roomId: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  periodNumber: z.number().int().positive(),
});

type PeriodFormData = z.infer<typeof periodSchema>;

interface PeriodFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PeriodFormData) => void;
  period?: any;
  subjects: any[];
  teachers: any[];
  rooms: any[];
  defaultValues?: Partial<PeriodFormData>;
  isLoading?: boolean;
}

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
];

export function PeriodForm({
  open,
  onClose,
  onSubmit,
  period,
  subjects,
  teachers,
  rooms,
  defaultValues,
  isLoading,
}: PeriodFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema),
    defaultValues: period
      ? {
          subjectId: period.subjectId,
          teacherId: period.teacherId,
          roomId: period.roomId || undefined,
          dayOfWeek: period.dayOfWeek,
          startTime: period.startTime,
          endTime: period.endTime,
          periodNumber: period.periodNumber,
        }
      : defaultValues,
  });

  const handleFormSubmit = (data: PeriodFormData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{period ? 'Edit Period' : 'Add Period'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <Select {...register('subjectId')} error={errors.subjectId?.message}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </Select>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Teacher *</label>
            <Select {...register('teacherId')} error={errors.teacherId?.message}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Room</label>
            <Select {...register('roomId')} error={errors.roomId?.message}>
              <option value="">Select room (optional)</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.building}
                </option>
              ))}
            </Select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium mb-1">Day *</label>
            <Select
              {...register('dayOfWeek', { valueAsNumber: true })}
              error={errors.dayOfWeek?.message}
            >
              <option value="">Select day</option>
              {DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time *</label>
              <Input
                type="time"
                {...register('startTime')}
                error={errors.startTime?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time *</label>
              <Input
                type="time"
                {...register('endTime')}
                error={errors.endTime?.message}
              />
            </div>
          </div>

          {/* Period Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Period Number *</label>
            <Input
              type="number"
              min="1"
              {...register('periodNumber', { valueAsNumber: true })}
              error={errors.periodNumber?.message}
              placeholder="e.g., 1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : period ? 'Update Period' : 'Add Period'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
