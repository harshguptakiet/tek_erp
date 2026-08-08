'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch (error: any) {
      // Don't reveal whether email exists or not
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 bg-[hsl(var(--background))]">
      <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-6"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-white font-bold text-xl">T</span>
          </div>
        </div>

        {!submitted ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight font-[var(--font-display)]">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email"
                      placeholder="name@school.edu"
                      className={`
                        w-full h-11 pl-11 pr-4 rounded-xl border text-sm
                        bg-[hsl(var(--background))] border-[hsl(var(--border))]
                        placeholder:text-[hsl(var(--muted-foreground)/0.5)]
                        focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                        transition-all duration-200
                        ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}
                      `}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full h-11 rounded-xl text-sm font-semibold text-white
                    flex items-center justify-center gap-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-200
                    hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]
                    active:scale-[0.98]
                  "
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg p-8 text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold font-[var(--font-display)]">Check your email</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              If an account exists for <strong>{getValues('email')}</strong>,
              you&apos;ll receive a password reset link shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-sm text-[hsl(var(--primary))] font-medium hover:underline"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
