/**
 * Leave Application Page
 * Apply for leave with supporting documents
 */

'use client';

import { LeaveApplicationForm } from '@/features/leaves/leave-application-form';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export default function LeaveApplicationPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Mock available leaves - replace with actual API call
  const availableLeaves = [
    { type: 'Casual Leave', balance: 10 },
    { type: 'Sick Leave', balance: 12 },
    { type: 'Earned Leave', balance: 5 },
    { type: 'Emergency Leave', balance: 3 },
  ];

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Replace with actual API call
      console.log('Submitting leave application:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Leave application submitted successfully!');
      router.push('/leaves');
    } catch (error) {
      toast.error('Failed to submit leave application');
      throw error;
    }
  };

  const userRole = user?.role === 'STUDENT' ? 'student' : 
                   user?.role === 'TEACHER' ? 'teacher' : 'staff';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Apply for Leave</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit your leave application
        </p>
      </div>

      <LeaveApplicationForm
        userRole={userRole}
        availableLeaves={availableLeaves}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
