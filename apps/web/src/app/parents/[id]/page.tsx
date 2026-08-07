/**
 * FR-USER-027 to FR-USER-032: Parent Detail View
 * Complete parent/guardian profile
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import Image from 'next/image';
import { use } from 'react';
import { userService } from '@/services/user.service';

export default function ParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Real API integration
  const { data: parent, isLoading } = useQuery({
    queryKey: ['parent', id],
    queryFn: () => userService.getParent(id),
    enabled: !!id,
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

  if (!parent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Parent not found</p>
            <Button className="mt-4" onClick={() => router.push('/parents')}>
              Back to Parents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {parent.profilePicture ? (
                  <Image
                    src={parent.profilePicture}
                    alt={parent.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 text-2xl font-bold">
                    {parent.firstName?.[0]}{parent.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Parent Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{parent.fullName}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <Badge
                    variant={parent.status === 'ACTIVE' ? 'success' : 'secondary'}
                  >
                    {parent.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{parent.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{parent.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupation:</span>
                    <span className="ml-2 font-medium">{parent.occupation || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employer:</span>
                    <span className="ml-2 font-medium">{parent.employer || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Can permission={PERMISSIONS.PARENTS_UPDATE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/parents/${id}/edit`)}
                >
                  Edit Profile
                </Button>
              </Can>
              <Button
                variant="outline"
                onClick={() => router.push('/parents')}
              >
                Back to List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{parent.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{parent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{parent.phone}</p>
            </div>
            {parent.alternatePhone && (
              <div>
                <p className="text-sm text-gray-600">Alternate Phone</p>
                <p className="font-medium">{parent.alternatePhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{parent.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Occupation</p>
              <p className="font-medium">{parent.occupation || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employer</p>
              <p className="font-medium">{parent.employer || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Linked Students */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Linked Students</CardTitle>
              <Can permission={PERMISSIONS.PARENTS_UPDATE}>
                <Button size="sm" variant="outline">
                  Link Student
                </Button>
              </Can>
            </div>
          </CardHeader>
          <CardContent>
            {parent.linkedStudents && parent.linkedStudents.length > 0 ? (
              <div className="space-y-3">
                {parent.linkedStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {student.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          Class {student.class} - Section {student.section}
                        </p>
                        <Badge variant="info" className="mt-1 text-xs">
                          {student.relationship}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/students/${student.id}`)}
                      >
                        View Student
                      </Button>
                      <Can permission={PERMISSIONS.PARENTS_UPDATE}>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          Unlink
                        </Button>
                      </Can>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                No students linked to this parent
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
