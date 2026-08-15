/**
 * FR-AUTH-010: Enable Two-Factor Authentication
 * Setup TOTP 2FA with QR code and backup codes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Shield, Copy, Download, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Enable2FAResponse {
  secret: string;
  qrCode: string;
  backupCodes?: string[];
}

export default function Enable2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrData, setQrData] = useState<Enable2FAResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Step 1: Generate QR code
  const generateQRMutation = useMutation({
    mutationFn: () => authService.enable2FA(),
    onSuccess: (data) => {
      setQrData(data as Enable2FAResponse);
      setStep('verify');
    },
    onError: (error: any) => {
      toast.error('Failed to generate 2FA setup', {
        description: error?.message || 'Please try again',
      });
    },
  });

  // Step 2: Verify code and complete setup
  const verify2FAMutation = useMutation({
    mutationFn: (code: string) =>
      authService.verify2FASetup(code),
    onSuccess: (data: any) => {
      setBackupCodes(data.backupCodes || []);
      setStep('backup');
      toast.success('2FA enabled successfully!');
    },
    onError: (error: any) => {
      toast.error('Invalid verification code', {
        description: 'Please check the code from your authenticator app',
      });
    },
  });

  const handleStartSetup = () => {
    generateQRMutation.mutate();
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast.error('Code must be 6 digits');
      return;
    }
    verify2FAMutation.mutate(verificationCode);
  };

  const handleCopySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      toast.success('Secret key copied to clipboard');
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const handleDownloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const handleFinish = () => {
    router.push('/settings/security');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enable Two-Factor Authentication</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['Setup', 'Verify', 'Backup Codes'].map((label, index) => {
          const stepNumber = index + 1;
          const currentStepNumber =
            step === 'setup' ? 1 : step === 'verify' ? 2 : 3;
          const isActive = stepNumber === currentStepNumber;
          const isComplete = stepNumber < currentStepNumber;

          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      isComplete
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {isComplete ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isComplete ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border bg-[hsl(var(--card))] p-6">
        {step === 'setup' && (
          <div className="space-y-6 text-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Secure Your Account</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Two-factor authentication adds an extra layer of security by requiring a code from
                your phone in addition to your password.
              </p>
            </div>
            <div className="space-y-3 text-left bg-[hsl(var(--secondary))] rounded-lg p-4">
              <p className="text-sm font-medium">You'll need:</p>
              <ul className="text-sm text-[hsl(var(--muted-foreground))] space-y-2 list-disc list-inside">
                <li>An authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Your phone to scan the QR code</li>
                <li>A safe place to store backup codes</li>
              </ul>
            </div>
            <Button
              onClick={handleStartSetup}
              disabled={generateQRMutation.isPending}
              className="w-full"
            >
              {generateQRMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )}

        {step === 'verify' && qrData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Open your authenticator app and scan this QR code
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <div className="relative h-64 w-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrData.qrCode}
                  alt="2FA QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Can't scan? Enter manually:</p>
              <div className="flex items-center gap-2 p-3 bg-[hsl(var(--secondary))] rounded-lg">
                <code className="flex-1 text-sm font-mono text-center">{qrData.secret}</code>
                <Button size="sm" variant="ghost" onClick={handleCopySecret}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Verification Input */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2 text-center">
                  Enter the 6-digit code from your app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="
                    w-full h-12 px-4 rounded-xl border text-center text-2xl tracking-widest font-mono
                    bg-[hsl(var(--background))] border-[hsl(var(--border))]
                    focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
                  "
                />
              </div>
              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || verify2FAMutation.isPending}
                className="w-full"
              >
                {verify2FAMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify and Continue'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">2FA Enabled Successfully!</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Save these backup codes in a safe place. You can use them to access your account if
                you lose your device.
              </p>
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Important: Save Your Backup Codes
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Each code can only be used once. If you lose access to your authenticator app,
                    these codes are the only way to regain access to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-4 bg-[hsl(var(--secondary))] rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center p-2 bg-[hsl(var(--background))] rounded">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopyBackupCodes} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Codes
                </Button>
                <Button onClick={handleDownloadBackupCodes} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <Button onClick={handleFinish} className="w-full">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
