/**
 * FR-USER-001: View User Profile
 * Display user profile with role-based information
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { format } from 'date-fns';
import Image from 'next/image';
import { formatAddress, getDisplayName } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion(profile);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your personal information and settings
          </p>
        </div>
        <Can permission="users:update">
          <Button onClick={() => router.push('/profile/edit')}>
            Edit Profile
          </Button>
        </Can>
      </div>

      {/* Profile Completion Warning */}
      {completionPercentage < 100 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Profile {completionPercentage}% complete
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Complete your profile to get the most out of the platform.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/profile/edit')}
                className="mt-3"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                  {profile.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt={getDisplayName(profile)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                  )}
                </div>

                {/* Name and Role */}
                <h2 className="mt-4 text-xl font-bold text-gray-900 text-center">
                  {profile.fullName}
                </h2>
                <Badge variant="info" className="mt-2">
                  {profile.role}
                </Badge>

                {/* Verification Badges */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {profile.emailVerified && (
                    <Badge variant="success">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Email Verified
                    </Badge>
                  )}
                  {profile.phoneVerified && (
                    <Badge variant="success">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Phone Verified
                    </Badge>
                  )}
                  {profile.twoFactorEnabled && (
                    <Badge variant="success">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      2FA Enabled
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(profile.createdAt), 'MMM yyyy')}
                    </span>
                  </div>
                  {profile.lastLogin && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last login</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(profile.lastLogin), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="First Name" value={profile.firstName} />
                <InfoField label="Middle Name" value={profile.middleName} />
                <InfoField label="Last Name" value={profile.lastName} />
                <InfoField label="Gender" value={profile.gender} />
                <InfoField 
                  label="Date of Birth" 
                  value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PP') : undefined} 
                />
                <InfoField label="Blood Group" value={profile.bloodGroup} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How we can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Email" value={profile.email} verified={profile.emailVerified} />
                <InfoField label="Phone" value={profile.phone} verified={profile.phoneVerified} />
              </div>
              
              {profile.address && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                  <div className="text-sm text-gray-700">
                    <p>{formatAddress(profile.address)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Account Status" 
                  value={
                    <Badge variant={profile.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {profile.status}
                    </Badge>
                  } 
                />
                <InfoField 
                  label="Profile Completion" 
                  value={`${completionPercentage}%`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ 
  label, 
  value, 
  verified 
}: { 
  label: string; 
  value?: React.ReactNode; 
  verified?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm text-gray-900">{value || '-'}</p>
        {verified && (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: any): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.dateOfBirth,
    profile.gender,
    profile.profilePicture,
    profile.bio,
    profile.address?.street,
    profile.address?.city,
    profile.emailVerified,
    profile.phoneVerified,
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}
