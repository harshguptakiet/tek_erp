/**
 * Module 17: System Settings - User Settings Hub
 * FR-SYSTEM-001: Advanced account and application settings
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  permission?: string;
  badge?: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Update your personal information, profile picture, and contact details',
    icon: '👤',
    href: '/profile/edit',
  },
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage email, phone, password, and account preferences',
    icon: '⚙️',
    href: '/settings/account',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Two-factor authentication, active sessions, login history, and privacy controls',
    icon: '🔒',
    href: '/account/security',
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Configure email, SMS, push, and in-app notification channels',
    icon: '🔔',
    href: '/notifications/preferences',
  },
  {
    id: 'appearance',
    title: 'Appearance & Display',
    description: 'Theme, language, date format, timezone, and accessibility options',
    icon: '🎨',
    href: '/settings/appearance',
  },
  {
    id: 'organization',
    title: 'Organization Settings',
    description: 'Organization profile, branding, academic year, and system configuration',
    icon: '🏢',
    href: '/organization/settings',
    permission: PERMISSIONS.ORG_SETTINGS,
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    description: 'Data export, account deactivation, privacy settings, and consent management',
    icon: '🛡️',
    href: '/account/privacy',
  },
  {
    id: 'activity',
    title: 'Activity Log',
    description: 'View your account activity, login history, and recent actions',
    icon: '📋',
    href: '/account/activity',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect Google, Microsoft, calendar sync, and third-party apps',
    icon: '🔗',
    href: '/settings/integrations',
  },
  {
    id: 'system',
    title: 'System Administration',
    description: 'System-wide settings, maintenance mode, and advanced configuration',
    icon: '🖥️',
    href: '/settings/system',
    permission: PERMISSIONS.SYSTEM_SETTINGS,
    badge: 'Admin',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account, preferences, and application settings
        </p>
      </div>

      <div className="space-y-3">
        {settingsSections.map((section) => {
          const content = (
            <Card
              key={section.id}
              className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200"
              onClick={() => router.push(section.href)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{section.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      {section.badge && <Badge variant="warning">{section.badge}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  </div>
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              </CardContent>
            </Card>
          );

          if (section.permission) {
            return (
              <Can key={section.id} permission={section.permission}>
                {content}
              </Can>
            );
          }

          return content;
        })}
      </div>

      <Card className="mt-8 border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Irreversible actions that affect your account permanently.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/account/privacy')}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Deactivate Account
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => router.push('/account/privacy')}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
