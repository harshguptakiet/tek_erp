/**
 * Module 03: Organization Settings
 * FR-ORG-006 to FR-ORG-015: Configuration and Preferences
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', permission: PERMISSIONS.ORGANIZATION_UPDATE },
    { id: 'academic', label: 'Academic', permission: PERMISSIONS.ORGANIZATION_UPDATE },
    { id: 'notifications', label: 'Notifications', permission: PERMISSIONS.ORGANIZATION_UPDATE },
    { id: 'integrations', label: 'Integrations', permission: PERMISSIONS.ORGANIZATION_UPDATE },
    { id: 'security', label: 'Security', permission: PERMISSIONS.ORGANIZATION_UPDATE },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure system preferences and organization-wide settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Can key={tab.id} permission={tab.permission}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            </Can>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <Select defaultValue="Asia/Kolkata">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <Select defaultValue="DD/MM/YYYY">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Select defaultValue="en">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="maintenance" />
                <label htmlFor="maintenance" className="text-sm text-gray-700">
                  Enable maintenance mode
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Year Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Academic Year
                </label>
                <Input type="text" defaultValue="2024-2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input type="date" defaultValue="2024-04-01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input type="date" defaultValue="2025-03-31" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grading System
                </label>
                <Select defaultValue="percentage">
                  <option value="percentage">Percentage (0-100)</option>
                  <option value="gpa">GPA (0-4)</option>
                  <option value="letter">Letter Grades (A-F)</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Attendance Required (%)
                </label>
                <Input type="number" defaultValue="75" min="0" max="100" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Parent Notifications</p>
                  <p className="text-sm text-gray-600">Send automated updates to parents</p>
                </div>
                <Checkbox defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Google Workspace</p>
                  <p className="text-sm text-gray-600">Connect with Google services</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Microsoft 365</p>
                  <p className="text-sm text-gray-600">Integrate with Microsoft services</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Payment Gateway</p>
                  <p className="text-sm text-gray-600">Setup payment processing</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">SMS Gateway</p>
                  <p className="text-sm text-gray-600">Configure SMS provider</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Enforce 2FA for All Users</p>
                  <p className="text-sm text-gray-600">Require two-factor authentication</p>
                </div>
                <Checkbox />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-gray-600">Automatic logout after inactivity</p>
                </div>
                <Select defaultValue="30" className="w-32">
                  <option value="15">15 mins</option>
                  <option value="30">30 mins</option>
                  <option value="60">60 mins</option>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Password Expiry</p>
                  <p className="text-sm text-gray-600">Force password change every</p>
                </div>
                <Select defaultValue="90" className="w-32">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="never">Never</option>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">IP Whitelist</p>
                  <p className="text-sm text-gray-600">Restrict access to specific IPs</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
