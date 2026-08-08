/**
 * Leave Application Form Component
 * For students, teachers, and staff to apply for leave
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Calendar, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const leaveSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  contactDuringLeave: z.string().optional(),
  attachments: z.any().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveApplicationFormProps {
  userRole: 'student' | 'teacher' | 'staff';
  availableLeaves: {
    type: string;
    balance: number;
  }[];
  onSubmit: (data: LeaveFormData & { files?: File[] }) => Promise<void>;
  onCancel: () => void;
}

export function LeaveApplicationForm({
  userRole,
  availableLeaves,
  onSubmit,
  onCancel,
}: LeaveApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate number of days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays();
  const selectedLeave = availableLeaves.find((l) => l.type === selectedLeaveType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = async (data: LeaveFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, files: selectedFiles });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveTypes = () => {
    switch (userRole) {
      case 'student':
        return ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Other'];
      case 'teacher':
        return ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Other'];
      case 'staff':
        return ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Other'];
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Leave Type Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Leave Type *</Label>
            <select
              {...register('leaveType')}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                register('leaveType').onChange(e);
                setSelectedLeaveType(e.target.value);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select leave type</option>
              {getLeaveTypes().map((type) => {
                const leave = availableLeaves.find((l) => l.type === type);
                return (
                  <option key={type} value={type}>
                    {type} {leave && `(${leave.balance} available)`}
                  </option>
                );
              })}
            </select>
            {errors.leaveType && (
              <p className="text-sm text-red-500 mt-1">{errors.leaveType.message}</p>
            )}
          </div>

          {selectedLeave && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You have <strong>{selectedLeave.balance}</strong> {selectedLeave.type} days available
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  {...register('startDate')}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label>End Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  {...register('endDate')}
                  min={startDate}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {days > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Duration:</strong> {days} day{days > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {days > (selectedLeave?.balance || 0) && selectedLeave && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Insufficient leave balance</p>
                <p>You're requesting {days} days but only have {selectedLeave.balance} days available. This may require special approval.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Reason and Contact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Reason for Leave *</Label>
            <Textarea
              {...register('reason')}
              rows={4}
              placeholder="Please provide a detailed reason for your leave application..."
              className="resize-none"
            />
            {errors.reason && (
              <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <Label>Contact During Leave (Optional)</Label>
            <Input
              {...register('contactDuringLeave')}
              placeholder="Phone number or email where you can be reached"
            />
          </div>

          <div>
            <Label>Supporting Documents (Optional)</Label>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  Medical certificate, invitation letter, etc.
                </span>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                      <span className="flex-1">{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
          {userRole === 'student' && (
            <>
              <li>Leave applications must be submitted at least 1 day in advance</li>
              <li>Emergency leaves require parent/guardian approval</li>
              <li>Medical leaves over 3 days require a doctor's certificate</li>
            </>
          )}
          {(userRole === 'teacher' || userRole === 'staff') && (
            <>
              <li>Leave applications should be submitted at least 3 days in advance</li>
              <li>Casual leaves are subject to approval by your reporting manager</li>
              <li>Medical leaves over 2 days require a medical certificate</li>
              <li>Ensure class coverage is arranged before taking leave</li>
            </>
          )}
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}
