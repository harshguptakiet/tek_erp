/**
 * Module 17: System Settings - Appearance & Display
 * FR-SYSTEM-002: Theme, language, and display preferences
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sun, Moon, Palette, Type, Globe, Calendar, Clock, Loader2 } from 'lucide-react';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: number;
  density: 'comfortable' | 'compact' | 'spacious';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export default function AppearanceSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0, // Sunday
    density: 'comfortable',
    animations: true,
    reducedMotion: false,
    highContrast: false,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<AppearanceSettings>) => 
      userService.updateProfile({ preferences: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Appearance settings updated');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleChange = (key: keyof AppearanceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          ← Back to settings
        </Button>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Appearance</h1>
        <p className="mt-2 text-sm text-gray-600">
          Customize the look and feel of your workspace
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>
              Choose your color scheme preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun, desc: 'Bright and clear' },
                { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                { value: 'system', label: 'System', icon: Palette, desc: 'Match device' },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleChange('theme', theme.value)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${settings.theme === theme.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <theme.icon className="h-8 w-8 text-gray-700" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{theme.label}</p>
                    <p className="text-xs text-gray-500">{theme.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>
              Adjust text size for better readability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <Select
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium (Recommended)</option>
                <option value="large">Large</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Density
              </label>
              <Select
                value={settings.density}
                onChange={(e) => handleChange('density', e.target.value)}
              >
                <option value="compact">Compact - More content</option>
                <option value="comfortable">Comfortable - Recommended</option>
                <option value="spacious">Spacious - More space</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Set your preferred language and regional formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Language
              </label>
              <Select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time Format
            </CardTitle>
            <CardDescription>
              Customize how dates and times are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <Select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <Select
                value={settings.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
              >
                <option value="12h">12-hour (2:30 PM)</option>
                <option value="24h">24-hour (14:30)</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Day of Week
              </label>
              <Select
                value={settings.firstDayOfWeek.toString()}
                onChange={(e) => handleChange('firstDayOfWeek', parseInt(e.target.value))}
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="6">Saturday</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>
              Options to improve accessibility and comfort
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Animations</p>
                <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
              </div>
              <button
                onClick={() => handleChange('animations', !settings.animations)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.animations ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.animations ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Reduced Motion</p>
                <p className="text-sm text-gray-500">Minimize motion for sensitive users</p>
              </div>
              <button
                onClick={() => handleChange('reducedMotion', !settings.reducedMotion)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">High Contrast</p>
                <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={() => handleChange('highContrast', !settings.highContrast)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your settings affect the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-500" />
                <div>
                  <p className={`font-semibold ${settings.fontSize === 'large' ? 'text-lg' : settings.fontSize === 'small' ? 'text-sm' : 'text-base'}`}>
                    John Doe
                  </p>
                  <p className={`text-gray-500 ${settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                    Student • Class 10A
                  </p>
                </div>
              </div>
              <div className={`p-4 bg-white rounded shadow-sm ${settings.density === 'compact' ? 'space-y-1' : settings.density === 'spacious' ? 'space-y-4' : 'space-y-2'}`}>
                <p className={`font-medium ${settings.fontSize === 'large' ? 'text-lg' : settings.fontSize === 'small' ? 'text-sm' : 'text-base'}`}>
                  Sample Content
                </p>
                <p className={`text-gray-600 ${settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  This is how text will appear with your current settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSettings({
                theme: 'light',
                fontSize: 'medium',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '12h',
                firstDayOfWeek: 0,
                density: 'comfortable',
                animations: true,
                reducedMotion: false,
                highContrast: false,
              });
              toast.success('Settings reset to defaults');
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
