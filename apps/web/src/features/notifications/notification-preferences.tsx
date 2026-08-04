'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  BellOff,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export function NotificationPreferences() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'push',
      name: 'Push Notifications',
      icon: <Bell className="w-5 h-5" />,
      enabled: true,
      description: 'Get notified in your browser',
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      enabled: true,
      description: 'Receive notifications via email',
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Smartphone className="w-5 h-5" />,
      enabled: false,
      description: 'Get text messages for important updates',
    },
    {
      id: 'inApp',
      name: 'In-App',
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: true,
      description: 'See notifications within the application',
    },
  ]);

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'assignments',
      name: 'Assignments',
      description: 'New assignments, submissions, and grading updates',
      channels: { push: true, email: true, sms: false, inApp: true },
    },
    {
      id: 'exams',
      name: 'Exams & Tests',
      description: 'Exam schedules, results, and announcements',
      channels: { push: true, email: true, sms: true, inApp: true },
    },
    {
      id: 'attendance',
      name: 'Attendance',
      description: 'Attendance alerts and reports',
      channels: { push: true, email: false, sms: true, inApp: true },
    },
    {
      id: 'fees',
      name: 'Fee Payments',
      description: 'Payment reminders and receipts',
      channels: { push: true, email: true, sms: true, inApp: true },
    },
    {
      id: 'announcements',
      name: 'School Announcements',
      description: 'General updates and important notices',
      channels: { push: true, email: true, sms: false, inApp: true },
    },
    {
      id: 'messages',
      name: 'Direct Messages',
      description: 'Messages from teachers, parents, and students',
      channels: { push: true, email: false, sms: false, inApp: true },
    },
    {
      id: 'liveClasses',
      name: 'Live Classes',
      description: 'Class start reminders and updates',
      channels: { push: true, email: true, sms: false, inApp: true },
    },
    {
      id: 'events',
      name: 'Events & Activities',
      description: 'School events, sports, and extracurricular activities',
      channels: { push: true, email: false, sms: false, inApp: true },
    },
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });

  const toggleChannel = (channelId: string) => {
    setChannels(
      channels.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  const toggleCategoryChannel = (
    categoryId: string,
    channelKey: keyof NotificationCategory['channels']
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              channels: { ...cat.channels, [channelKey]: !cat.channels[channelKey] },
            }
          : cat
      )
    );
  };

  const enableAll = () => {
    setCategories(
      categories.map((cat) => ({
        ...cat,
        channels: { push: true, email: true, sms: true, inApp: true },
      }))
    );
    toast.success('All notifications enabled');
  };

  const disableAll = () => {
    setCategories(
      categories.map((cat) => ({
        ...cat,
        channels: { push: false, email: false, sms: false, inApp: false },
      }))
    );
    toast.success('All notifications disabled');
  };

  const savePreferences = () => {
    // In real app, save to backend
    toast.success('Preferences saved successfully');
  };

  const getChannelColor = (channelKey: string) => {
    switch (channelKey) {
      case 'push':
        return 'bg-blue-100 text-blue-800';
      case 'email':
        return 'bg-green-100 text-green-800';
      case 'sms':
        return 'bg-purple-100 text-purple-800';
      case 'inApp':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    channel.enabled
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => toggleChannel(channel.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    p-2 rounded-lg
                    ${channel.enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}
                  >
                    {channel.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{channel.name}</p>
                      <Checkbox checked={channel.enabled} />
                    </div>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification Categories</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={enableAll}>
                Enable All
              </Button>
              <Button variant="outline" size="sm" onClick={disableAll}>
                <BellOff className="w-4 h-4 mr-2" />
                Disable All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category, index) => (
              <div key={category.id}>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(category.channels).map(([key, value]) => {
                      const channel = channels.find((ch) => ch.id === key);
                      if (!channel) return null;

                      return (
                        <button
                          key={key}
                          onClick={() =>
                            toggleCategoryChannel(
                              category.id,
                              key as keyof NotificationCategory['channels']
                            )
                          }
                          disabled={!channel.enabled}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${
                              value && channel.enabled
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200'
                            }
                            ${!channel.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            {value && channel.enabled ? (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className="text-sm font-medium capitalize">{key}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {index < categories.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={quietHours.enabled}
              onCheckedChange={(checked) =>
                setQuietHours({ ...quietHours, enabled: checked as boolean })
              }
            />
            <label className="text-sm">Enable quiet hours (mute non-urgent notifications)</label>
          </div>

          {quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ℹ️ During quiet hours, only urgent notifications (emergency alerts, fee due dates)
              will be delivered.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Notification Summary</p>
              <p className="text-sm text-muted-foreground mt-1">
                {channels.filter((ch) => ch.enabled).length} channels enabled •{' '}
                {categories.reduce(
                  (sum, cat) =>
                    sum + Object.values(cat.channels).filter((v) => v).length,
                  0
                )}{' '}
                category subscriptions active
              </p>
            </div>
            <Button onClick={savePreferences}>
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
