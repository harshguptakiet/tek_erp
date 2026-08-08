/**
 * Leave Dashboard Page
 * View all leave applications and balance
 */

'use client';

import { useState } from 'react';
import { useMyLeaves, useLeaveBalance } from '@/features/leaves/use-leaves';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LeavesDashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: leaves, isLoading } = useMyLeaves({ status: statusFilter || undefined });
  const { data: leaveBalance } = useLeaveBalance();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Leaves</h1>
          <p className="text-muted-foreground">Manage your leave applications</p>
        </div>
        <div className="flex gap-2">
          <Link href="/leaves/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Link href="/leaves/apply">
            <Button>Apply for Leave</Button>
          </Link>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {leaveBalance?.map((balance) => (
          <Card key={balance.leaveTypeId} className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                {balance.leaveTypeName}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{balance.available}</span>
                <span className="text-sm text-muted-foreground">
                  / {balance.totalAllowed} days
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used:</span>
                  <span className="font-medium">{balance.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium">{balance.pending}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Filter by Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Leave Applications */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Applied On</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Loading leaves...
                  </td>
                </tr>
              ) : leaves?.length ? (
                leaves.map((leave) => (
                  <tr key={leave.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{leave.leaveTypeName}</td>
                    <td className="px-4 py-3">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {leave.totalDays}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/leaves/${leave.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {leave.status === 'PENDING' && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leave applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
