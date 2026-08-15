/**
 * Backup Codes Management Page
 * View remaining codes and regenerate if needed
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BackupCodesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [showCodes, setShowCodes] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Fetch backup codes status
  const { data: backupCodesStatus, isLoading } = useQuery({
    queryKey: ['backup-codes-status'],
    queryFn: () => authService.getBackupCodesStatus(),
    enabled: user?.twoFactorEnabled === true,
  });

  // Regenerate backup codes mutation
  const regenerateMutation = useMutation({
    mutationFn: (password: string) => authService.regenerateBackupCodes(password),
    onSuccess: (data) => {
      toast.success('Backup codes regenerated successfully');
      queryClient.invalidateQueries({ queryKey: ['backup-codes-status'] });
      setShowRegenerateDialog(false);
      setPassword('');
      setShowCodes(true);

      // Download new codes automatically
      downloadCodes(data.backupCodes);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to regenerate codes');
      toast.error('Failed to regenerate backup codes');
    },
  });

  // Check if 2FA is enabled
  if (!user?.twoFactorEnabled) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>Two-factor authentication is not enabled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Enable 2FA first to generate backup codes.
            </p>
            <Button onClick={() => router.push('/settings/security/2fa/enable')}>
              <Shield className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRevealCodes = () => {
    setShowCodes(!showCodes);
  };

  const handleCopyCodes = () => {
    if (!backupCodesStatus?.codes) return;

    const codesText = backupCodesStatus.codes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success('Backup codes copied to clipboard');
  };

  const downloadCodes = (codes: string[]) => {
    const codesText = codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const handleDownloadCodes = () => {
    if (!backupCodesStatus?.codes) return;
    downloadCodes(backupCodesStatus.codes);
  };

  const handleRegenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    regenerateMutation.mutate(password);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  const remainingCodes = backupCodesStatus?.remaining || 0;
  const totalCodes = backupCodesStatus?.total || 10;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/settings/security"
        className="inline-flex items-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Security Settings
      </Link>

      {/* Warning if running low */}
      {remainingCodes <= 3 && remainingCodes > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> You only have {remainingCodes} backup code
            {remainingCodes !== 1 && 's'} remaining. Consider regenerating new codes.
          </AlertDescription>
        </Alert>
      )}

      {remainingCodes === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical:</strong> You have no backup codes remaining. Regenerate codes
            immediately to avoid being locked out.
          </AlertDescription>
        </Alert>
      )}

      {/* Backup Codes Card */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[hsl(var(--primary))]/10">
                <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <CardTitle>Backup Recovery Codes</CardTitle>
                <CardDescription>
                  Use these codes if you lose access to your authenticator app
                </CardDescription>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">
                {remainingCodes} / {totalCodes}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Codes remaining</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Important Instructions */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <h4 className="text-sm font-medium mb-2 text-blue-600 dark:text-blue-400">
              Important Information
            </h4>
            <ul className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
              <li>• Each code can only be used once</li>
              <li>• Store these codes in a safe place</li>
              <li>• Use these codes if you lose your authenticator device</li>
              <li>• Regenerating codes will invalidate all previous codes</li>
            </ul>
          </div>

          {/* Codes Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Your Backup Codes</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevealCodes}
                disabled={!backupCodesStatus?.codes || backupCodesStatus.codes.length === 0}
              >
                {showCodes ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Codes
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Codes
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg border bg-[hsl(var(--muted))]/30 p-6">
              {backupCodesStatus?.codes && backupCodesStatus.codes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {backupCodesStatus.codes.map((code: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--card))] border font-mono text-sm"
                    >
                      <span className="text-[hsl(var(--muted-foreground))]">{index + 1}.</span>
                      <span className="flex-1">
                        {showCodes ? code : '••••••••••••'}
                      </span>
                      {backupCodesStatus.used?.includes(code) && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" title="Used" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No backup codes available</p>
                  <p className="text-sm">Regenerate codes to create new ones</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {backupCodesStatus?.codes && backupCodesStatus.codes.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopyCodes}
                className="flex-1"
                disabled={!showCodes}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCodes}
                className="flex-1"
                disabled={!showCodes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => setShowRegenerateDialog(true)}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All Codes
            </Button>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 text-center">
              This will invalidate all existing codes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Backup Codes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create 10 new backup codes and invalidate all existing codes. Make sure to
              save the new codes in a secure location.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleRegenerateSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Confirm Your Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={regenerateMutation.isPending}
                autoComplete="current-password"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPassword('')}>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={regenerateMutation.isPending || !password}
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Regenerate Codes'
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
