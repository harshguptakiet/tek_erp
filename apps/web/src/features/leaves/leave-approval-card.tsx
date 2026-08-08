/**
 * Leave Approval Card Component
 * For managers to approve/reject leave applications
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

interface LeaveApplication {
  id: string;
  applicant: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    employeeId?: string;
    class?: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  contactDuringLeave?: string;
  attachments?: {
    name: string;
    url: string;
    size: number;
  }[];
  appliedOn: string;
  status: 'pending' | 'approved' | 'rejected';
  leaveBalance?: number;
}

interface LeaveApprovalCardProps {
  application: LeaveApplication;
  onApprove: (id: string, remarks?: string) => Promise<void>;
  onReject: (id: string, remarks: string) => Promise<void>;
  showActions?: boolean;
}

export function LeaveApprovalCard({
  application,
  onApprove,
  onReject,
  showActions = true,
}: LeaveApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [approveRemarks, setApproveRemarks] = useState('');

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(application.id, approveRemarks);
    } finally {
      setIsProcessing(false);
      setApproveRemarks('');
    }
  };

  const handleReject = async () => {
    if (!rejectRemarks.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(application.id, rejectRemarks);
    } finally {
      setIsProcessing(false);
      setShowRejectForm(false);
      setRejectRemarks('');
    }
  };

  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    approved: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
    },
  };

  const config = statusConfig[application.status];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {application.applicant.avatar ? (
              <img src={application.applicant.avatar} alt={application.applicant.name} />
            ) : (
              <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
                {application.applicant.name.charAt(0)}
              </div>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{application.applicant.name}</h3>
            <p className="text-sm text-muted-foreground">
              {application.applicant.role}
              {application.applicant.employeeId && ` • ${application.applicant.employeeId}`}
              {application.applicant.class && ` • ${application.applicant.class}`}
            </p>
          </div>
        </div>
        <Badge className={config.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </Badge>
      </div>

      {/* Leave Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Leave Type:</span>
            <span className="font-medium">{application.leaveType}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {format(new Date(application.startDate), 'MMM dd')} - {format(new Date(application.endDate), 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Days:</span>
            <span className="font-medium">{application.days} day{application.days > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Applied On:</span>
            <span className="font-medium">{format(new Date(application.appliedOn), 'MMM dd, yyyy')}</span>
          </div>

          {application.leaveBalance !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Leave Balance:</span>
              <span className={`font-medium ${application.leaveBalance < application.days ? 'text-red-600' : ''}`}>
                {application.leaveBalance} days
              </span>
            </div>
          )}

          {application.contactDuringLeave && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{application.contactDuringLeave}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Reason for Leave:</h4>
        <div className="p-3 bg-muted rounded-lg text-sm">
          {application.reason}
        </div>
      </div>

      {/* Attachments */}
      {application.attachments && application.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Attachments:</h4>
          <div className="space-y-2">
            {application.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={file.url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if insufficient balance */}
      {application.leaveBalance !== undefined && application.leaveBalance < application.days && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This leave request exceeds the available balance by{' '}
            {application.days - application.leaveBalance} day(s). Approving will result in negative balance.
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && application.status === 'pending' && (
        <div className="space-y-3 pt-4 border-t">
          {!showRejectForm ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Remarks (Optional)</label>
                <Textarea
                  placeholder="Add any remarks for the applicant..."
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Approve Leave'}
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Leave
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block text-red-600">
                  Rejection Reason (Required) *
                </label>
                <Textarea
                  placeholder="Please provide a clear reason for rejection..."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  rows={3}
                  className="resize-none border-red-300 focus:border-red-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectRemarks('');
                  }}
                  variant="outline"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectRemarks.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
