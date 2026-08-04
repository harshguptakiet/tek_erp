/**
 * Module 02: User Management - Privacy & Data Management
 * FR-USER-005: Privacy settings, data export, and account deletion
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Download, Trash2, AlertTriangle, Eye, EyeOff, Lock, FileText, Loader2 } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowMessaging: boolean;
  allowNotifications: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

export default function PrivacyPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    allowNotifications: true,
    dataSharing: false,
    analyticsTracking: true,
  });

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const updatePrivacyMutation = useMutation({
    mutationFn: (data: Partial<PrivacySettings>) => 
      userService.updateProfile({ privacySettings: data }),
    onSuccess: () => {
      toast.success('Privacy settings updated');
    },
    onError: () => {
      toast.error('Failed to update privacy settings');
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { downloadUrl: '/api/user/export/data.zip' };
    },
    onSuccess: (data) => {
      toast.success('Your data export is ready');
      // Trigger download
      window.location.href = data.downloadUrl;
    },
    onError: () => {
      toast.error('Failed to export data');
    },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: () => userService.deactivateAccount(),
    onSuccess: () => {
      toast.success('Account deactivated. You can reactivate anytime.');
      router.push('/auth/login');
    },
    onError: () => {
      toast.error('Failed to deactivate account');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      router.push('/');
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });

  const handleToggle = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updatePrivacyMutation.mutate({ [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          ← Back to settings
        </Button>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Privacy & Data</h1>
        <p className="mt-2 text-sm text-gray-600">
          Control your privacy settings and manage your data
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Profile Visibility
            </CardTitle>
            <CardDescription>
              Control who can view your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see your profile?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                  { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
                  { value: 'friends', label: 'Connections', desc: 'Only your connections can view' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${settings.profileVisibility === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={settings.profileVisibility === option.value}
                      onChange={(e) => handleToggle('profileVisibility', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Email</p>
                  <p className="text-sm text-gray-600">Display email on your profile</p>
                </div>
                <button
                  onClick={() => handleToggle('showEmail', !settings.showEmail)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.showEmail ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.showEmail ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Phone</p>
                  <p className="text-sm text-gray-600">Display phone number on your profile</p>
                </div>
                <button
                  onClick={() => handleToggle('showPhone', !settings.showPhone)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.showPhone ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.showPhone ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Control how others can contact you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Allow Messaging</p>
                <p className="text-sm text-gray-600">Let others send you messages</p>
              </div>
              <button
                onClick={() => handleToggle('allowMessaging', !settings.allowMessaging)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.allowMessaging ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.allowMessaging ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Allow Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications about activities</p>
              </div>
              <button
                onClick={() => handleToggle('allowNotifications', !settings.allowNotifications)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.allowNotifications ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.allowNotifications ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data & Analytics
            </CardTitle>
            <CardDescription>
              Control how your data is used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Data Sharing</p>
                <p className="text-sm text-gray-600">Share anonymized data for platform improvement</p>
              </div>
              <button
                onClick={() => handleToggle('dataSharing', !settings.dataSharing)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.dataSharing ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.dataSharing ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Analytics Tracking</p>
                <p className="text-sm text-gray-600">Allow usage analytics for better experience</p>
              </div>
              <button
                onClick={() => handleToggle('analyticsTracking', !settings.analyticsTracking)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.analyticsTracking ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Your Data
            </CardTitle>
            <CardDescription>
              Export a copy of your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Download a complete copy of your profile, activity history, and all associated data in a portable format.
            </p>
            <Button
              onClick={() => exportDataMutation.mutate()}
              disabled={exportDataMutation.isPending}
            >
              {exportDataMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              You'll receive a download link once your data is ready (usually within 24 hours)
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deactivate */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Deactivate Account</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Temporarily disable your account. You can reactivate anytime by logging in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateModal(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Deactivate
                </Button>
              </div>
            </div>

            {/* Delete */}
            <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 border-red-300 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-orange-600">Deactivate Account?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Your account will be temporarily disabled. You can reactivate it anytime by logging back in.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    deactivateAccountMutation.mutate();
                    setShowDeactivateModal(false);
                  }}
                  disabled={deactivateAccountMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {deactivateAccountMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account Permanently?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-900 font-medium">⚠️ This action cannot be undone!</p>
              </div>
              <p className="text-sm text-gray-600">
                All your data will be permanently deleted, including:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Profile information</li>
                <li>Activity history</li>
                <li>Uploaded files</li>
                <li>Settings and preferences</li>
              </ul>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmText('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (confirmText === 'DELETE') {
                      deleteAccountMutation.mutate();
                      setShowDeleteModal(false);
                    }
                  }}
                  disabled={confirmText !== 'DELETE' || deleteAccountMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Forever'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
