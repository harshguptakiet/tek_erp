/**
 * FR-AUTH-011 & FR-AUTH-012: Complete Login Form
 * Supports email and phone login with all features
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { LoginRequest } from '@/types/auth.types';

type LoginMethod = 'email' | 'phone';

const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const phoneLoginSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type EmailLoginData = z.infer<typeof emailLoginSchema>;
type PhoneLoginData = z.infer<typeof phoneLoginSchema>;

export function CompleteLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const emailForm = useForm<EmailLoginData>({
    resolver: formResolver(emailLoginSchema),
    defaultValues: { rememberMe: false },
  });

  const phoneForm = useForm<PhoneLoginData>({
    resolver: formResolver(phoneLoginSchema),
    defaultValues: { rememberMe: false },
  });

  const currentForm = loginMethod === 'email' ? emailForm : phoneForm;

  const onSubmit = async (data: EmailLoginData | PhoneLoginData) => {
    try {
      const loginData: LoginRequest = loginMethod === 'email'
        ? {
            email: (data as EmailLoginData).email,
            password: data.password,
            rememberMe: data.rememberMe,
          }
        : {
            phone: (data as PhoneLoginData).phone,
            password: data.password,
            rememberMe: data.rememberMe,
          };

      const response = await loginMutation.mutateAsync(loginData);

      if (response.requiresTwoFactor) {
        router.push('/auth/2fa-verify');
      } else {
        router.push(returnUrl);
      }
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Phone
        </button>
      </div>

      {/* Login Form */}
      <form className="space-y-4" onSubmit={currentForm.handleSubmit(onSubmit)}>
        {/* Email or Phone Input */}
        {loginMethod === 'email' ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1234567890"
              {...phoneForm.register('phone')}
              error={phoneForm.formState.errors.phone?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              Include country code (e.g., +91 for India)
            </p>
          </div>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...(loginMethod === 'email'
                ? emailForm.register('password')
                : phoneForm.register('password'))}
              error={
                loginMethod === 'email'
                  ? emailForm.formState.errors.password?.message
                  : phoneForm.formState.errors.password?.message
              }
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            label="Remember me"
            {...(loginMethod === 'email'
              ? emailForm.register('rememberMe')
              : phoneForm.register('rememberMe'))}
          />

          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={currentForm.formState.isSubmitting || loginMutation.isPending}
        >
          {currentForm.formState.isSubmitting || loginMutation.isPending
            ? 'Signing in...'
            : 'Sign in'}
        </Button>

        {/* OAuth Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/auth/oauth/google"
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Link>

          <Link
            href="/auth/oauth/microsoft"
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#00a4ef" d="M13 1h10v10H13z"/>
              <path fill="#7fba00" d="M1 13h10v10H1z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft
          </Link>
        </div>
      </form>

      {/* Security Notice */}
      <p className="mt-4 text-center text-xs text-gray-500">
        Account will be locked after 5 failed login attempts
      </p>
    </div>
  );
}
