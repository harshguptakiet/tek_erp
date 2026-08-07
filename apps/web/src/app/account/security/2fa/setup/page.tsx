/**
 * FR-AUTH-021: Enable TOTP 2FA Setup Wizard
 * Complete 2FA setup flow with QR code, verification, and backup codes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const verifySchema = z.object({
  code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/, 'Must be numbers only'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

type SetupStep = 'intro' | 'scan' | 'verify' | 'backup-codes' | 'complete';

export default function Setup2FAPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<SetupStep>('intro');
  const [qrCodeData, setQrCodeData] = useState<{
    qrCode: string;
    secret: string;
  } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormData>({
    resolver: formResolver(verifySchema),
  });

  // Check if 2FA is already enabled
  if (user?.twoFactorEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>2FA is already enabled on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Your account is protected with two-factor authentication. You can manage
              your backup codes or disable 2FA from the security dashboard.
            </p>
            <div className="flex space-x-3">
              <Button onClick={() => router.push('/account/security')}>
                Back to Security
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/account/security/2fa/backup-codes')}
              >
                View Backup Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const response = await authService.enable2FA();
      setQrCodeData({
        qrCode: response.qrCode,
        secret: response.secret,
      });
      setCurrentStep('scan');
    } catch (error) {
      toast.error('Failed to start 2FA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async (data: VerifyFormData) => {
    try {
      const response = await authService.verify2FASetup(data.code);
      setBackupCodes(response.backupCodes);
      toast.success('2FA verified successfully!');
      setCurrentStep('backup-codes');
    } catch (error) {
      toast.error('Invalid code. Please try again.');
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `Backup Codes for ${user?.email}\n\n` +
      backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
      '\n\nStore these codes in a safe place. Each code can only be used once.';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const handleComplete = () => {
    setCurrentStep('complete');
    setTimeout(() => {
      router.push('/account/security');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Setup Progress</span>
          <span className="text-sm text-gray-500">
            Step {currentStep === 'intro' ? 1 : currentStep === 'scan' ? 2 : currentStep === 'verify' ? 3 : currentStep === 'backup-codes' ? 4 : 5} of 5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width:
                currentStep === 'intro' ? '20%' :
                currentStep === 'scan' ? '40%' :
                currentStep === 'verify' ? '60%' :
                currentStep === 'backup-codes' ? '80%' : '100%',
            }}
          />
        </div>
      </div>

      {/* Step 1: Introduction */}
      {currentStep === 'intro' && (
        <Card>
          <CardHeader>
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What is 2FA?</h4>
              <p className="text-sm text-blue-800">
                Two-factor authentication (2FA) adds an extra layer of security by
                requiring a code from your phone in addition to your password.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">What you'll need:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>An authenticator app</strong> like Google Authenticator, Authy,
                    or Microsoft Authenticator
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Your mobile device</strong> with the app installed
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>About 5 minutes</strong> to complete setup
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    Make sure you have access to your authenticator app before starting.
                    You'll also receive backup codes to save in a secure location.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/account/security')}
              >
                Cancel
              </Button>
              <Button onClick={handleStartSetup} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Start Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Scan QR Code */}
      {currentStep === 'scan' && qrCodeData && (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use your authenticator app to scan this code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <div
                  dangerouslySetInnerHTML={{ __html: qrCodeData.qrCode }}
                  className="w-64 h-64"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Can't scan the QR code?
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Enter this code manually in your authenticator app:
                </p>
                <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm break-all">
                  {qrCodeData.secret}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How to scan
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open your authenticator app</li>
                <li>Tap "+" or "Add account"</li>
                <li>Choose "Scan QR code"</li>
                <li>Point your camera at the QR code above</li>
              </ol>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('intro')}
              >
                Back
              </Button>
              <Button onClick={() => setCurrentStep('verify')}>
                Next: Verify Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Verify Code */}
      {currentStep === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Code</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onVerifyCode)} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  {...register('code')}
                  error={errors.code?.message}
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">
                  The code changes every 30 seconds
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> The code must match what's currently shown in your
                  authenticator app. If it doesn't work, wait for the next code.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('scan')}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Backup Codes */}
      {currentStep === 'backup-codes' && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Save Your Backup Codes</CardTitle>
            <CardDescription>
              Store these codes in a safe place - you'll need them if you lose access to
              your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Important!</h4>
                  <p className="text-sm text-red-700 mt-1">
                    These codes will only be shown once. Download or copy them now.
                    Each code can only be used once.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-3 rounded border border-gray-300 font-mono text-sm text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDownloadBackupCodes}
                className="flex-1"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast.success('Backup codes copied to clipboard');
                }}
                className="flex-1"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Codes
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Where to store backup codes:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Password manager (recommended)</li>
                <li>Encrypted file on your computer</li>
                <li>Printed and stored in a safe place</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/account/security')}
              >
                I'll Do This Later
              </Button>
              <Button onClick={handleComplete}>
                I've Saved My Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {currentStep === 'complete' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Two-Factor Authentication Enabled!
              </h3>
              <p className="text-gray-600">
                Your account is now more secure. You'll need your authenticator app to
                log in from now on.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to security dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
