/**
 * FR-AUTH-024: Backup Codes Management
 * View, download, and regenerate backup codes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBackupCodes } from '@/hooks/use-auth-queries';
import { authService } from '@/services/auth-complete.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function BackupCodesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: backupCodesData, isLoading, refetch } = useBackupCodes();
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Check if 2FA is enabled
  if (!user?.twoFactorEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>Two-factor authentication is not enabled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              You need to enable two-factor authentication before you can manage backup codes.
            </p>
            <Button onClick={() => router.push('/account/security/2fa/setup')}>
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const codes = backupCodesData?.codes || [];
  const remaining = backupCodesData?.remaining ?? codes.filter((c) => !c.used).length;

  const handleDownloadCodes = () => {
    const text = `Backup Codes for ${user?.email}\n\n` +
      codes.map((item, i: number) => `${i + 1}. ${item.code}`).join('\n') +
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

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const handleRegenerateCodes = async () => {
    setIsRegenerating(true);
    try {
      await authService.regenerateBackupCodes();
      await refetch();
      toast.success('Backup codes regenerated successfully');
      setShowRegenerateDialog(false);
    } catch (error) {
      toast.error('Failed to regenerate backup codes');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backup Codes</h1>
            <p className="mt-2 text-sm text-gray-600">
              Use these codes if you lose access to your authenticator app
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/account/security')}
          >
            ← Back to Security
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Codes Remaining</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {remaining} / {codes.length}
              </p>
            </div>
            <div className={`h-20 w-20 rounded-full flex items-center justify-center ${
              remaining <= 2 ? 'bg-red-100' : remaining <= 5 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <svg className={`h-10 w-10 ${
                remaining <= 2 ? 'text-red-600' : remaining <= 5 ? 'text-yellow-600' : 'text-green-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for low codes */}
      {remaining <= 2 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Low Backup Codes</h3>
              <p className="text-sm text-red-700 mt-1">
                You only have {remaining} backup {remaining === 1 ? 'code' : 'codes'} left. 
                Consider regenerating your codes to get a fresh set.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Display */}
      <Card>
        <CardHeader>
          <CardTitle>Your Backup Codes</CardTitle>
          <CardDescription>
            Each code can only be used once. Store them in a safe place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-3">
              {codes.map((item, index) => (
                <div
                  key={index}
                  className="bg-white px-4 py-3 rounded border border-gray-300 font-mono text-sm text-center"
                >
                  {typeof item === 'string' ? item : item.code}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadCodes}
              className="flex-1"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Codes
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyCodes}
              className="flex-1"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Codes
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(true)}
              className="flex-1 text-yellow-600 hover:text-yellow-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate Codes
            </Button>
          </div>

          {/* Info Boxes */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to use backup codes:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>When prompted for 2FA, select "Use backup code"</li>
                <li>Enter one of your backup codes</li>
                <li>The code will be marked as used and cannot be reused</li>
                <li>Log in to your authenticator app and continue normally</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Storage recommendations:</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Store codes in a password manager (recommended)</li>
                <li>Print and keep in a secure physical location</li>
                <li>Save in an encrypted file on your device</li>
                <li>Never share these codes with anyone</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Important:</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Regenerating backup codes will invalidate all your current codes.
                    Make sure you've saved your new codes before closing this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes?</DialogTitle>
            <DialogDescription>
              This will invalidate all your current backup codes and generate a new set.
              You won't be able to use your old codes anymore.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Make sure to download or save your new codes after regenerating.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerateCodes}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Codes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
