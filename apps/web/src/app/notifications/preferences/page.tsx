/**
 * Module 14: Notifications - Notification Preferences
 * FR-NOTIF-020 to FR-NOTIF-025: Manage notification settings
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface NotificationSetting {
  id: string;
  category: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export default function NotificationPreferencesPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'assignments',
      category: 'Academic',
      label: 'Assignments',
      description: 'New assignments, submissions, and grades',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'live_classes',
      category: 'Academic',
      label: 'Live Classes',
      description: 'Class reminders, recordings, and schedule changes',
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
    {
      id: 'exams',
      category: 'Academic',
      label: 'Exams',
      description: 'Exam schedules, results, and announcements',
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
    {
      id: 'attendance',
      category: 'Academic',
      label: 'Attendance',
      description: 'Attendance alerts and reports',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'grades',
      category: 'Academic',
      label: 'Grades & Results',
      description: 'Grade updates and report cards',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'fees',
      category: 'Financial',
      label: 'Fee Payments',
      description: 'Payment reminders, receipts, and due dates',
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
    {
      id: 'announcements',
      category: 'General',
      label: 'Announcements',
      description: 'School announcements and important notices',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'events',
      category: 'General',
      label: 'Events',
      description: 'Event invitations and reminders',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'content',
      category: 'General',
      label: 'Study Materials',
      description: 'New content, notes, and resources',
      email: false,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'messages',
      category: 'Communication',
      label: 'Messages',
      description: 'Direct messages from teachers and staff',
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      id: 'parent_updates',
      category: 'Communication',
      label: 'Parent Updates',
      description: 'Updates shared with parents/guardians',
      email: true,
      sms: true,
      push: false,
      inApp: true,
    },
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: '22:00',
    endTime: '07:00',
  });

  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('DAILY');

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast.success('Notification preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleToggle = (id: string, channel: 'email' | 'sms' | 'push' | 'inApp') => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [channel]: !setting[channel] } : setting
      )
    );
  };

  const handleEnableAll = (channel: 'email' | 'sms' | 'push' | 'inApp') => {
    setSettings((prev) =>
      prev.map((setting) => ({ ...setting, [channel]: true }))
    );
  };

  const handleDisableAll = (channel: 'email' | 'sms' | 'push' | 'inApp') => {
    setSettings((prev) =>
      prev.map((setting) => ({ ...setting, [channel]: false }))
    );
  };

  const handleSave = () => {
    saveMutation.mutate({
      settings,
      quietHours,
      digest: { enabled: digestEnabled, frequency: digestFrequency },
    });
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
            ← Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="mt-2 text-sm text-gray-600">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Notification Type
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700 w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>📧 Email</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEnableAll('email')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            All
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => handleDisableAll('email')}
                            className="text-xs text-gray-600 hover:text-gray-700"
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700 w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>💬 SMS</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEnableAll('sms')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            All
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => handleDisableAll('sms')}
                            className="text-xs text-gray-600 hover:text-gray-700"
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700 w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>📱 Push</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEnableAll('push')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            All
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => handleDisableAll('push')}
                            className="text-xs text-gray-600 hover:text-gray-700"
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700 w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>🔔 In-App</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEnableAll('inApp')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            All
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => handleDisableAll('inApp')}
                            className="text-xs text-gray-600 hover:text-gray-700"
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                    <>
                      <tr key={category} className="bg-gray-50">
                        <td colSpan={5} className="py-2 px-2 font-semibold text-sm text-gray-700">
                          {category}
                        </td>
                      </tr>
                      {categorySettings.map((setting) => (
                        <tr key={setting.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-900">{setting.label}</p>
                              <p className="text-xs text-gray-600">{setting.description}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <input
                              type="checkbox"
                              checked={setting.email}
                              onChange={() => handleToggle(setting.id, 'email')}
                              className="rounded"
                            />
                          </td>
                          <td className="text-center py-3 px-2">
                            <input
                              type="checkbox"
                              checked={setting.sms}
                              onChange={() => handleToggle(setting.id, 'sms')}
                              className="rounded"
                            />
                          </td>
                          <td className="text-center py-3 px-2">
                            <input
                              type="checkbox"
                              checked={setting.push}
                              onChange={() => handleToggle(setting.id, 'push')}
                              className="rounded"
                            />
                          </td>
                          <td className="text-center py-3 px-2">
                            <input
                              type="checkbox"
                              checked={setting.inApp}
                              onChange={() => handleToggle(setting.id, 'inApp')}
                              className="rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quietHoursEnabled"
                checked={quietHours.enabled}
                onChange={(e) =>
                  setQuietHours((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="rounded"
              />
              <label htmlFor="quietHoursEnabled" className="text-sm font-medium text-gray-700">
                Enable Quiet Hours (no notifications during this time)
              </label>
            </div>

            {quietHours.enabled && (
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.startTime}
                    onChange={(e) =>
                      setQuietHours((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.endTime}
                    onChange={(e) =>
                      setQuietHours((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              ℹ️ Quiet hours apply to push and SMS notifications only. Critical alerts will still be delivered.
            </div>
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Digest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="digestEnabled"
                checked={digestEnabled}
                onChange={(e) => setDigestEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="digestEnabled" className="text-sm font-medium text-gray-700">
                Receive notification summary digest via email
              </label>
            </div>

            {digestEnabled && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Digest Frequency
                </label>
                <select
                  value={digestFrequency}
                  onChange={(e) => setDigestFrequency(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="DAILY">Daily (8:00 AM)</option>
                  <option value="WEEKLY">Weekly (Monday 8:00 AM)</option>
                  <option value="MONTHLY">Monthly (1st of month)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Get a summary of all notifications in a single email
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">📧 Email Notifications</h3>
              <p className="text-sm text-gray-600 mb-2">
                Sent to: <span className="font-medium">student@example.com</span>
              </p>
              <Button size="sm" variant="outline">
                Change Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">💬 SMS Notifications</h3>
              <p className="text-sm text-gray-600 mb-2">
                Sent to: <span className="font-medium">+91 98765 43210</span>
              </p>
              <Button size="sm" variant="outline">
                Change Phone
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/notifications')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
