/**
 * FR-USER-011 to FR-USER-018: Student Detail View
 * Complete student profile with tabs
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

type TabType = 'overview' | 'academic' | 'attendance' | 'performance' | 'health' | 'achievements' | 'behavior';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => userService.getStudent(id),
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

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Student not found</p>
            <Button className="mt-4" onClick={() => router.push('/students')}>
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'academic', label: 'Academic History', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'attendance', label: 'Attendance', permission: PERMISSIONS.ATTENDANCE_VIEW },
    { id: 'performance', label: 'Performance', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'health', label: 'Health Records', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'achievements', label: 'Achievements', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'behavior', label: 'Behavior', permission: PERMISSIONS.STUDENTS_VIEW },
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
                {student.profilePicture ? (
                  <Image
                    src={student.profilePicture}
                    alt={getDisplayName(student)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student.fullName}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <Badge
                    variant={
                      student.status === 'ACTIVE' ? 'success' :
                      student.status === 'INACTIVE' ? 'secondary' :
                      student.status === 'SUSPENDED' ? 'error' : 'info'
                    }
                  >
                    {student.status}
                  </Badge>
                  {student.isVerified && (
                    <Badge variant="info">Verified</Badge>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Admission No:</span>
                    <span className="ml-2 font-mono font-medium">{student.admissionNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Roll No:</span>
                    <span className="ml-2 font-medium">{student.rollNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Class:</span>
                    <span className="ml-2 font-medium">Class {student.class} - Section {student.section}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="ml-2 font-medium">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{student.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{student.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/students/${id}/edit`)}
                >
                  Edit Profile
                </Button>
              </Can>
              <Button
                variant="outline"
                onClick={() => router.push('/students')}
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
                    ? 'border-indigo-500 text-indigo-600'
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
                <p className="font-medium">{student.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{student.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium">{student.bloodGroup || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{formatAddress(student.address)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Class & Section</p>
                <p className="font-medium">Class {student.class} - Section {student.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Number</p>
                <p className="font-mono font-medium">{student.admissionNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-medium">{student.rollNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-medium">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="font-medium">{student.academicYear || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Student Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student Phone</p>
                <p className="font-medium">{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parent/Guardian Phone</p>
                <p className="font-medium">{student.parentPhone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <p className="font-medium">{student.emergencyContact || '-'}</p>
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
                <span className="text-sm text-gray-600">Overall Attendance</span>
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current GPA</span>
                <span className="text-lg font-bold text-blue-600">3.8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Achievements</span>
                <span className="text-lg font-bold text-purple-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Present (This Month)</span>
                <span className="text-lg font-bold text-indigo-600">18/20</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'academic' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Academic history view will be implemented in the next iteration.
              <Button
                variant="link"
                className="ml-2"
                onClick={() => router.push(`/students/${id}/academic-history`)}
              >
                View Full Academic History →
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Attendance summary will be implemented in Module 10 (Attendance).
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Performance metrics will be implemented in Module 09 (Assessment).
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'health' && (
        <Card>
          <CardHeader>
            <CardTitle>Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Health records view will be implemented in the next iteration.
              <Button
                variant="link"
                className="ml-2"
                onClick={() => router.push(`/students/${id}/health`)}
              >
                View Health Records →
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements & Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Achievements gallery will be implemented in the next iteration.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'behavior' && (
        <Can permission={PERMISSIONS.STUDENTS_VIEW}>
          <Card>
            <CardHeader>
              <CardTitle>Behavior & Discipline Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Behavior tracking will be implemented in the next iteration.
              </p>
            </CardContent>
          </Card>
        </Can>
      )}
    </div>
  );
}
