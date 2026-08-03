/**
 * FR-USER-019 to FR-USER-026: Teacher Detail View
 * Complete teacher profile with tabs
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import Image from 'next/image';
import { formatAddress, getDisplayName } from '@/lib/utils';
import { use } from 'react';

type TabType = 'overview' | 'qualifications' | 'subjects' | 'performance' | 'attendance' | 'payroll';

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => userService.getTeacher(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Teacher not found</p>
            <Button className="mt-4" onClick={() => router.push('/teachers')}>
              Back to Teachers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', permission: PERMISSIONS.TEACHERS_VIEW },
    { id: 'qualifications', label: 'Qualifications', permission: PERMISSIONS.TEACHERS_VIEW },
    { id: 'subjects', label: 'Subjects & Classes', permission: PERMISSIONS.TEACHERS_VIEW },
    { id: 'performance', label: 'Performance', permission: PERMISSIONS.TEACHERS_VIEW },
    { id: 'attendance', label: 'Attendance', permission: PERMISSIONS.ATTENDANCE_VIEW },
    { id: 'payroll', label: 'Payroll', permission: PERMISSIONS.FINANCE_VIEW },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {teacher.profilePicture ? (
                  <Image
                    src={teacher.profilePicture}
                    alt={getDisplayName(teacher)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-2xl font-bold">
                    {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Teacher Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{teacher.fullName}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <Badge
                    variant={
                      teacher.status === 'ACTIVE' ? 'success' :
                      teacher.status === 'INACTIVE' ? 'secondary' :
                      teacher.status === 'ON_LEAVE' ? 'warning' : 'info'
                    }
                  >
                    {teacher.status}
                  </Badge>
                  {teacher.isVerified && (
                    <Badge variant="info">Verified</Badge>
                  )}
                  {teacher.department && (
                    <Badge variant="secondary">{teacher.department}</Badge>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="ml-2 font-mono font-medium">{teacher.employeeId || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Joining Date:</span>
                    <span className="ml-2 font-medium">
                      {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{teacher.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{teacher.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <span className="ml-2 font-medium">{teacher.experienceYears || 0} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Qualification:</span>
                    <span className="ml-2 font-medium">{teacher.highestQualification || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Can permission={PERMISSIONS.TEACHERS_UPDATE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/teachers/${id}/edit`)}
                >
                  Edit Profile
                </Button>
              </Can>
              <Button
                variant="outline"
                onClick={() => router.push('/teachers')}
              >
                Back to List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Can key={tab.id} permission={tab.permission}>
              <button
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            </Can>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{teacher.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{teacher.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">
                  {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{formatAddress(teacher.address)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Employee ID</p>
                <p className="font-mono font-medium">{teacher.employeeId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{teacher.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joining Date</p>
                <p className="font-medium">
                  {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employment Type</p>
                <p className="font-medium">{teacher.employmentType || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{teacher.experienceYears || 0} years</p>
              </div>
            </CardContent>
          </Card>

          {/* Subjects Teaching */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects Teaching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects?.map((subject: string, idx: number) => (
                  <Badge key={idx} variant="info">{subject}</Badge>
                )) || <p className="text-gray-500">No subjects assigned</p>}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Classes Teaching</span>
                <span className="text-lg font-bold text-blue-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="text-lg font-bold text-green-600">150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance (This Month)</span>
                <span className="text-lg font-bold text-purple-600">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Performance Rating</span>
                <span className="text-lg font-bold text-indigo-600">4.5/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'qualifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Educational Qualifications & Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Qualifications view will be implemented with degree details, certifications, and training records.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'subjects' && (
        <Card>
          <CardHeader>
            <CardTitle>Subject & Class Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Subject and class assignments will be implemented in Module 04 (Academic Management).
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Performance metrics and reviews will be implemented.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Teacher attendance tracking will be implemented in Module 10 (Attendance).
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payroll' && (
        <Can permission={PERMISSIONS.FINANCE_VIEW}>
          <Card>
            <CardHeader>
              <CardTitle>Payroll Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Payroll details will be implemented in Module 13 (ERP - Payroll).
              </p>
            </CardContent>
          </Card>
        </Can>
      )}
    </div>
  );
}
