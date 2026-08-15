/**
 * FR-AUTH-019: Password Expiry Warning Banner
 * Shows on dashboard when password is expiring soon or expired
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { AlertTriangle, XCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export function PasswordExpiryBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: passwordStatus, isLoading } = useQuery({
    queryKey: ['password-expiry'],
    queryFn: () => authService.checkPasswordExpiry(),
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  if (isLoading || dismissed) return null;
  if (!passwordStatus) return null;

  // Show critical alert if expired
  if (passwordStatus.isExpired) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-red-200 bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Password Expired</p>
                <p className="text-sm opacity-90">
                  Your password has expired. You must change it now to continue using your account.
                </p>
              </div>
            </div>
            <Link href="/settings/security/password">
              <Button size="sm" className="bg-white text-red-600 hover:bg-red-50">
                Change Password
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if expiring within 7 days
  if (passwordStatus.daysRemaining <= 7) {
    const isUrgent = passwordStatus.daysRemaining <= 3;
    
    return (
      <div
        className={`
          border-b shadow-sm
          ${isUrgent 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200' 
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200'
          }
        `}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isUrgent ? (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    isUrgent 
                      ? 'text-red-900 dark:text-red-100' 
                      : 'text-amber-900 dark:text-amber-100'
                  }`}
                >
                  Password Expiring {passwordStatus.daysRemaining === 0 ? 'Today' : passwordStatus.daysRemaining === 1 ? 'Tomorrow' : `in ${passwordStatus.daysRemaining} Days`}
                </p>
                <p
                  className={`text-sm ${
                    isUrgent 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  Change your password now to avoid being locked out of your account.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings/security/password">
                <Button
                  size="sm"
                  className={
                    isUrgent
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }
                >
                  Change Password
                </Button>
              </Link>
              {!isUrgent && (
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
                >
                  <X className="h-4 w-4 text-amber-700" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show info banner if expiring within 14 days
  if (passwordStatus.daysRemaining <= 14) {
    return (
      <div className="border-b border-blue-200 bg-blue-50 dark:bg-blue-950/20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Password Expires in {passwordStatus.daysRemaining} Days
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Consider changing your password soon to maintain account security.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings/security/password">
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                  Change Password
                </Button>
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
              >
                <X className="h-4 w-4 text-blue-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
