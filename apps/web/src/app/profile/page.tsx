'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, MapPin, Edit, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Fetch complete user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userData = profile || user;

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your profile information</p>
        </div>
        <Button onClick={() => router.push('/profile/edit')}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData?.firstName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-primary" />
                )}
              </div>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {userData?.firstName} {userData?.middleName} {userData?.lastName}
                </h2>
                <Badge variant="outline">{userData?.role}</Badge>
                <Badge
                  variant={userData?.status === 'active' ? 'default' : 'secondary'}
                  className={userData?.status === 'active' ? 'bg-green-500' : ''}
                >
                  {userData?.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{userData?.email}</span>
                </div>
                {userData?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{userData?.phone}</span>
                  </div>
                )}
                {userData?.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Born {new Date(userData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-semibold capitalize">{userData?.gender || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-semibold">{userData?.bloodGroup || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nationality</p>
              <p className="font-semibold">{userData?.nationality || 'Not specified'}</p>
            </div>
            {userData?.language && (
              <div>
                <p className="text-sm text-muted-foreground">Preferred Language</p>
                <p className="font-semibold">{userData.language}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{userData?.email}</p>
            </div>
            {userData?.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{userData.phone}</p>
              </div>
            )}
            {userData?.alternatePhone && (
              <div>
                <p className="text-sm text-muted-foreground">Alternate Phone</p>
                <p className="font-semibold">{userData.alternatePhone}</p>
              </div>
            )}
            {userData?.address && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <p className="text-sm">{userData.address}</p>
                {userData.city && userData.state && (
                  <p className="text-sm text-muted-foreground">
                    {userData.city}, {userData.state} {userData.pincode}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact (for students) */}
        {userData?.role === 'student' && userData?.emergencyContact && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{userData.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-semibold">{userData.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{userData.emergencyContact.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Info (for students/teachers) */}
        {(userData?.role === 'student' || userData?.role === 'teacher') && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.role === 'student' && (
                <>
                  {userData?.admissionNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Number</p>
                      <p className="font-mono font-semibold">{userData.admissionNumber}</p>
                    </div>
                  )}
                  {userData?.class && (
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-semibold">
                        {userData.class.name} - {userData.section?.name}
                      </p>
                    </div>
                  )}
                  {userData?.rollNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="font-semibold">{userData.rollNumber}</p>
                    </div>
                  )}
                </>
              )}
              {userData?.role === 'teacher' && (
                <>
                  {userData?.employeeId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-mono font-semibold">{userData.employeeId}</p>
                    </div>
                  )}
                  {userData?.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-semibold">{userData.department}</p>
                    </div>
                  )}
                  {userData?.subjects && userData.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {userData.subjects.map((subject: any) => (
                          <Badge key={subject.id} variant="secondary">
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Security */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {userData?.twoFactorEnabled
                    ? 'Enabled - Your account is protected'
                    : 'Not enabled - Add an extra layer of security'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/account/security/2fa/setup')}
              >
                {userData?.twoFactorEnabled ? 'Manage' : 'Enable'}
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-semibold">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed {userData?.lastPasswordChange ? new Date(userData.lastPasswordChange).toLocaleDateString() : 'never'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/account/security/change-password')}
              >
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-semibold">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Manage your active sessions across devices
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/account/security/devices')}
              >
                View Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
