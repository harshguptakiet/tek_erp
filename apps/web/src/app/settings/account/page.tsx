/**
 * Module 17: System Settings - Account Settings
 * FR-SYSTEM-002: Manage account preferences and credentials
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const accountSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

type AccountForm = z.infer<typeof accountSchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'general' | 'contact' | 'preferences'>('general');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountForm>({
    resolver: formResolver(accountSchema),
    defaultValues: {
      displayName: 'John Doe',
      email: 'john.doe@school.edu',
      phone: '+91 98765 43210',
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AccountForm) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return data;
    },
    onSuccess: () => toast.success('Account settings saved successfully!'),
    onError: () => toast.error('Failed to save settings.'),
  });

  const onSubmit = (data: AccountForm) => saveMutation.mutate(data);

  const sections = [
    { id: 'general' as const, label: 'General' },
    { id: 'contact' as const, label: 'Contact Info' },
    { id: 'preferences' as const, label: 'Preferences' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.push('/settings')} className="mb-4">
        ← Back to Settings
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Account Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-500">Member since January 2024</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeSection === 'general' && (
          <Card>
            <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <Input {...register('displayName')} />
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <Input value="USR-2024-001234" disabled />
                <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Input value="Teacher" disabled />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'contact' && (
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="flex gap-2">
                  <Input {...register('email')} className="flex-1" />
                  <Badge variant="success">Verified</Badge>
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <Input {...register('phone')} className="flex-1" />
                  <Badge variant="success">Verified</Badge>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.push('/account/security/change-password')}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'preferences' && (
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <Select {...register('language')}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <Select {...register('timezone')}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <Select {...register('dateFormat')}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>
              <div className="pt-4 border-t space-y-3">
                <p className="font-medium text-gray-900">Communication Preferences</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('emailNotifications')} className="rounded" />
                  <span className="text-sm text-gray-700">Email notifications for important updates</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('smsNotifications')} className="rounded" />
                  <span className="text-sm text-gray-700">SMS notifications for urgent alerts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('marketingEmails')} className="rounded" />
                  <span className="text-sm text-gray-700">Receive product updates and newsletters</span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/settings')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending || !isDirty}>
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
