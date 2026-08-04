/**
 * Module 03: Organization Management
 * FR-ORG-001 to FR-ORG-005: Organization Profile
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import Image from 'next/image';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';

export default function OrganizationProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Real API integration
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization-profile', user?.schoolId],
    queryFn: () => userService.getOrganizationProfile(user?.schoolId || ''),
    enabled: !!user?.schoolId,
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your organization information
          </p>
        </div>
        <div className="flex gap-2">
          <Can permission={PERMISSIONS.ORGANIZATION_UPDATE}>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </>
            )}
          </Can>
          <Button variant="outline" onClick={() => router.push('/organization/settings')}>
            Settings
          </Button>
        </div>
      </div>

      {/* Organization Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {organization?.logo ? (
                <Image
                  src={organization.logo}
                  alt={organization.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                  {organization?.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900">{organization?.name}</h2>
              <p className="text-gray-600 mt-1">{organization?.legalName}</p>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant={organization?.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {organization?.status}
                </Badge>
                <Badge variant="info">{organization?.type}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-blue-600">{organization?.totalStudents}</p>
                </div>
                <div>
                  <p className="text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-green-600">{organization?.totalTeachers}</p>
                </div>
                <div>
                  <p className="text-gray-600">Staff</p>
                  <p className="text-2xl font-bold text-purple-600">{organization?.totalStaff}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Organization Name</p>
              <p className="font-medium">{organization?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Legal Name</p>
              <p className="font-medium">{organization?.legalName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="font-mono font-medium">{organization?.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Established Date</p>
              <p className="font-medium">
                {organization?.establishedDate 
                  ? new Date(organization.establishedDate).toLocaleDateString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <a 
                href={organization?.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {organization?.website}
              </a>
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
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{organization?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{organization?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{organization?.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium">{organization?.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium">{organization?.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-medium">{organization?.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pincode</p>
                <p className="font-medium">{organization?.pincode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership */}
        <Card>
          <CardHeader>
            <CardTitle>Leadership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Principal/Head</p>
              <p className="font-medium">{organization?.principalName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Principal Email</p>
              <p className="font-medium">{organization?.principalEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {organization?.about || 'No description available'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
