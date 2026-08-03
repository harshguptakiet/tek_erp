/**
 * FR-USER-009: Privacy Settings
 * Manage privacy and data sharing preferences
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useProfile, useUpdatePrivacySettings } from '@/hooks/use-user-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PrivacyFormData {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showEmail: boolean;
  showPhone: boolean;
  allowSearchEngineIndexing: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  allowAnalyticsTracking: boolean;
  allowMarketingEmails: boolean;
  allowNotifications: boolean;
}

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdatePrivacySettings();

  const { register, handleSubmit, watch } = useForm<PrivacyFormData>({
    defaultValues: (profile?.privacySettings as PrivacyFormData | undefined) || {
      profileVisibility: 'CONNECTIONS_ONLY',
      showEmail: false,
      showPhone: false,
      allowSearchEngineIndexing: false,
      showOnlineStatus: true,
      allowDirectMessages: true,
      allowAnalyticsTracking: true,
      allowMarketingEmails: false,
      allowNotifications: true,
    },
  });

  const onSubmit = async (data: PrivacyFormData) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Control who can see your information and how we use your data
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/profile')}>
            ← Back to Profile
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Who can view your profile?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PUBLIC"
                    {...register('profileVisibility')}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Public</span>
                    <p className="text-sm text-gray-500">Anyone can view your profile</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="CONNECTIONS_ONLY"
                    {...register('profileVisibility')}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Connections Only</span>
                    <p className="text-sm text-gray-500">Only people in your organization can view</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PRIVATE"
                    {...register('profileVisibility')}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Private</span>
                    <p className="text-sm text-gray-500">Only you can view your profile</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-start">
                <Checkbox id="showEmail" {...register('showEmail')} />
                <label htmlFor="showEmail" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Show email address</span>
                  <p className="text-sm text-gray-500">Allow others to see your email</p>
                </label>
              </div>

              <div className="flex items-start">
                <Checkbox id="showPhone" {...register('showPhone')} />
                <label htmlFor="showPhone" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Show phone number</span>
                  <p className="text-sm text-gray-500">Allow others to see your phone</p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Discovery */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Discovery</CardTitle>
            <CardDescription>
              Control how others can find you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <Checkbox id="allowSearchEngineIndexing" {...register('allowSearchEngineIndexing')} />
              <label htmlFor="allowSearchEngineIndexing" className="ml-3">
                <span className="text-sm font-medium text-gray-900">
                  Allow search engines to index your profile
                </span>
                <p className="text-sm text-gray-500">
                  Your profile may appear in Google and other search engines
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Activity and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Activity and Status</CardTitle>
            <CardDescription>
              Control your online presence and activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <Checkbox id="showOnlineStatus" {...register('showOnlineStatus')} />
              <label htmlFor="showOnlineStatus" className="ml-3">
                <span className="text-sm font-medium text-gray-900">Show online status</span>
                <p className="text-sm text-gray-500">Let others see when you're online</p>
              </label>
            </div>

            <div className="flex items-start">
              <Checkbox id="allowDirectMessages" {...register('allowDirectMessages')} />
              <label htmlFor="allowDirectMessages" className="ml-3">
                <span className="text-sm font-medium text-gray-900">Allow direct messages</span>
                <p className="text-sm text-gray-500">Let others send you direct messages</p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Data and Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Data and Analytics</CardTitle>
            <CardDescription>
              Control how we collect and use your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <Checkbox id="allowAnalyticsTracking" {...register('allowAnalyticsTracking')} />
              <label htmlFor="allowAnalyticsTracking" className="ml-3">
                <span className="text-sm font-medium text-gray-900">Allow analytics tracking</span>
                <p className="text-sm text-gray-500">
                  Help us improve by collecting anonymous usage data
                </p>
              </label>
            </div>

            <div className="flex items-start">
              <Checkbox id="allowMarketingEmails" {...register('allowMarketingEmails')} />
              <label htmlFor="allowMarketingEmails" className="ml-3">
                <span className="text-sm font-medium text-gray-900">Receive marketing emails</span>
                <p className="text-sm text-gray-500">Get updates about new features and offers</p>
              </label>
            </div>

            <div className="flex items-start">
              <Checkbox id="allowNotifications" {...register('allowNotifications')} />
              <label htmlFor="allowNotifications" className="ml-3">
                <span className="text-sm font-medium text-gray-900">Enable notifications</span>
                <p className="text-sm text-gray-500">
                  Receive notifications about account activity
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* GDPR Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
            <CardDescription>
              Under GDPR, you have rights over your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-800">
                    You have the right to access, rectify, erase, restrict processing, and port your data.
                    You can also object to processing and withdraw consent at any time.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/account/data-export')}
                >
                  Download My Data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/account/deactivate')}
                  className="text-red-600 hover:text-red-700"
                >
                  Deactivate Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
