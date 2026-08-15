'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

function AccountLockedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Multiple failed login attempts';
  const minutes = searchParams.get('minutes');
  const isPermanent = searchParams.get('permanent') === 'true';

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 bg-[hsl(var(--background))]">
      <div className="w-full max-w-[440px] space-y-8 animate-fade-in">
        {/* Logo Header */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-6"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-white font-bold text-xl">T</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg p-8 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight font-[var(--font-display)]">
              Account Locked
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {isPermanent
                ? 'Your account has been permanently locked for security policy reasons.'
                : minutes
                ? `Your account is temporarily locked. Please try again in ${minutes} minute(s).`
                : reason}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-left space-y-3 text-sm">
            <div className="font-semibold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              What can you do?
            </div>
            <ul className="space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary))] font-bold">•</span>
                Wait for the lockout timer to expire if temporary.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary))] font-bold">•</span>
                Use Forgot Password to reset your password and unlock your account.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary))] font-bold">•</span>
                Contact your organization administrator to assist with unlocking.
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/auth/forgot-password"
              className="
                w-full h-11 rounded-xl text-sm font-semibold text-white
                flex items-center justify-center gap-2
                transition-all duration-200
                hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]
                active:scale-[0.98]
              "
              style={{ background: 'var(--gradient-primary)' }}
            >
              <KeyRound className="h-4 w-4" />
              Reset password
            </Link>

            <Link
              href="/auth/login"
              className="
                w-full h-11 rounded-xl text-sm font-medium border border-[hsl(var(--border))]
                flex items-center justify-center gap-2
                hover:bg-[hsl(var(--muted)/0.5)] transition-all duration-200
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountLockedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      }
    >
      <AccountLockedContent />
    </Suspense>
  );
}

