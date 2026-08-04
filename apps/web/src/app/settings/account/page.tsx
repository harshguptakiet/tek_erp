/**
 * Module 02: User Management - Account Settings
 * FR-USER-003: Manage account preferences
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Phone, Loader2 } from 'lucide-react';

const emailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

const phoneSchema = z.object({
  countryCode: z.string().min(1, 'Country code required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const languageSchema = z.object({
  language: z.string().min(1, 'Please select a language'),
  timezone: z.string().min(1, 'Please select a timezone'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;
type LanguageFormData = z.infer<typeof languageSchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const emailForm = useForm<EmailFormData>({
    resolver: formResolver(emailSchema),
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: formResolver(phoneSchema),
    defaultValues: {
      countryCode: '+91',
      phoneNumber: profile?.phone || '',
    },
  });

  const languageForm = useForm<LanguageFormData>({
    resolver: formResolver(languageSchema),
    defaultValues: {
      language: profile?.language || 'en',
      timezone: profile?.timezone || 'Asia/Kolkata',
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: (data: EmailFormData) => userService.updateEmail(data.newEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Email update initiated. Please check your new email for verification.');
      setEditingEmail(false);
      emailForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update email');
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: (data: PhoneFormData) => 
      userService.updateProfile({ phone: `${data.countryCode}${data.phoneNumber}` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Phone number updated successfully');
      setEditingPhone(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update phone');
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (data: LanguageFormData) => 
      userService.updateProfile({ 
        language: data.language,
        timezone: data.timezone,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: () => userService.resendVerificationEmail(),
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: () => {
      toast.error('Failed to send verification email');
    },
  });

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
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your email, phone number, and account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Address
            </CardTitle>
            <CardDescription>
              Your email is used for login and important notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!editingEmail ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile?.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <>
                        <Badge variant="warning">Not Verified</Badge>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => resendVerificationMutation.mutate()}
                          disabled={resendVerificationMutation.isPending}
                        >
                          {resendVerificationMutation.isPending ? 'Sending...' : 'Resend verification'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={() => setEditingEmail(true)}>
                  Change Email
                </Button>
              </div>
            ) : (
              <form onSubmit={emailForm.handleSubmit((data) => updateEmailMutation.mutate(data))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="new.email@example.com"
                    {...emailForm.register('newEmail')}
                    error={emailForm.formState.errors.newEmail?.message}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You'll need to verify your new email address
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateEmailMutation.isPending}
                  >
                    {updateEmailMutation.isPending ? 'Updating...' : 'Update Email'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingEmail(false);
                      emailForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Phone Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Number
            </CardTitle>
            <CardDescription>
              Used for SMS notifications and two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!editingPhone ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{profile?.phone || 'Not set'}</p>
                  {profile?.phoneVerified && (
                    <Badge variant="success" className="mt-1">Verified</Badge>
                  )}
                </div>
                <Button variant="outline" onClick={() => setEditingPhone(true)}>
                  {profile?.phone ? 'Change' : 'Add'} Phone
                </Button>
              </div>
            ) : (
              <form onSubmit={phoneForm.handleSubmit((data) => updatePhoneMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country Code
                    </label>
                    <Select
                      {...phoneForm.register('countryCode')}
                      error={phoneForm.formState.errors.countryCode?.message}
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (US/Canada)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+86">+86 (China)</option>
                      <option value="+81">+81 (Japan)</option>
                      <option value="+61">+61 (Australia)</option>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      {...phoneForm.register('phoneNumber')}
                      error={phoneForm.formState.errors.phoneNumber?.message}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updatePhoneMutation.isPending}
                  >
                    {updatePhoneMutation.isPending ? 'Updating...' : 'Update Phone'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPhone(false);
                      phoneForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Language & Timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
            <CardDescription>
              Set your preferred language and timezone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={languageForm.handleSubmit((data) => updateLanguageMutation.mutate(data))} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <Select
                    {...languageForm.register('language')}
                    error={languageForm.formState.errors.language?.message}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <Select
                    {...languageForm.register('timezone')}
                    error={languageForm.formState.errors.timezone?.message}
                  >
                    <option value="Asia/Kolkata">IST (UTC+5:30) - India</option>
                    <option value="America/New_York">EST (UTC-5) - New York</option>
                    <option value="America/Los_Angeles">PST (UTC-8) - Los Angeles</option>
                    <option value="Europe/London">GMT (UTC+0) - London</option>
                    <option value="Asia/Dubai">GST (UTC+4) - Dubai</option>
                    <option value="Asia/Tokyo">JST (UTC+9) - Tokyo</option>
                    <option value="Australia/Sydney">AEDT (UTC+11) - Sydney</option>
                  </Select>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={updateLanguageMutation.isPending || !languageForm.formState.isDirty}
              >
                {updateLanguageMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Username (Read-only for now) */}
        <Card>
          <CardHeader>
            <CardTitle>Username</CardTitle>
            <CardDescription>
              Your unique identifier on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-medium text-gray-900">
                  @{profile?.username || profile?.email?.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Username changes are not currently supported
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account ID */}
        <Card>
          <CardHeader>
            <CardTitle>Account ID</CardTitle>
            <CardDescription>
              Your unique account identifier for support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                {profile?.id}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.id || '');
                  toast.success('Account ID copied to clipboard');
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
