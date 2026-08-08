/**
 * Leave Approval Page
 * For managers to approve/reject leave applications
 */

'use client';

import { useState } from 'react';
import { LeaveApprovalCard } from '@/features/leaves/leave-approval-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LeaveApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Mock leave applications - replace with actual API call
  const mockApplications = [
    {
      id: '1',
      applicant: {
        id: 'user-1',
        name: 'John Smith',
        role: 'Teacher',
        employeeId: 'T-12345',
      },
      leaveType: 'Sick Leave',
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      days: 3,
      reason: 'Suffering from viral fever. Doctor has advised complete bed rest for 3 days.',
      contactDuringLeave: '+91 9876543210',
      attachments: [
        { name: 'medical_certificate.pdf', url: '#', size: 245678 },
      ],
      appliedOn: '2026-08-07',
      status: 'pending' as const,
      leaveBalance: 12,
    },
    {
      id: '2',
      applicant: {
        id: 'user-2',
        name: 'Sarah Johnson',
        role: 'Student',
        class: 'Class 10 A',
      },
      leaveType: 'Casual Leave',
      startDate: '2026-08-15',
      endDate: '2026-08-17',
      days: 3,
      reason: 'Family wedding ceremony to attend in another city. Will need 3 days leave.',
      appliedOn: '2026-08-06',
      status: 'pending' as const,
      leaveBalance: 8,
    },
    {
      id: '3',
      applicant: {
        id: 'user-3',
        name: 'Michael Brown',
        role: 'Teacher',
        employeeId: 'T-67890',
      },
      leaveType: 'Earned Leave',
      startDate: '2026-08-20',
      endDate: '2026-08-25',
      days: 6,
      reason: 'Planning a family vacation. Have arranged for substitute teacher.',
      contactDuringLeave: 'michael.brown@email.com',
      appliedOn: '2026-08-05',
      status: 'approved' as const,
      leaveBalance: 15,
    },
    {
      id: '4',
      applicant: {
        id: 'user-4',
        name: 'Emily Davis',
        role: 'Staff',
        employeeId: 'S-11223',
      },
      leaveType: 'Casual Leave',
      startDate: '2026-08-08',
      endDate: '2026-08-08',
      days: 1,
      reason: 'Personal urgent work.',
      appliedOn: '2026-08-04',
      status: 'rejected' as const,
      leaveBalance: 10,
    },
  ];

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch =
      app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = app.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (id: string, remarks?: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Approving leave:', id, remarks);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Leave application approved successfully');
    } catch (error) {
      toast.error('Failed to approve leave application');
      throw error;
    }
  };

  const handleReject = async (id: string, remarks: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Rejecting leave:', id, remarks);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Leave application rejected');
    } catch (error) {
      toast.error('Failed to reject leave application');
      throw error;
    }
  };

  const pendingCount = mockApplications.filter((a) => a.status === 'pending').length;
  const approvedCount = mockApplications.filter((a) => a.status === 'approved').length;
  const rejectedCount = mockApplications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Approvals</h1>
          <p className="text-muted-foreground">Review and manage leave applications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending: {pendingCount}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Approved: {approvedCount}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-red-600">
            <XCircle className="h-3 w-3" />
            Rejected: {rejectedCount}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or leave type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <LeaveApprovalCard
                key={application.id}
                application={application}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={application.status === 'pending'}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No applications found matching your search'
                  : `No ${activeTab} applications`}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
