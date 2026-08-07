/**
 * FR-AUTH-001: Email Registration Page
 * Complete registration flow with validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { useRegister } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import type { RegisterRequest } from '@/types/auth.types';

// FR-AUTH-008: Registration Validation Schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name required').max(50),
  lastName: z.string().min(2, 'Last name required').max(50),
  middleName: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: formResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const requestData: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        acceptTerms: data.acceptTerms,
      };

      await registerMutation.mutateAsync(requestData);
      router.push('/auth/verify-email-sent');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            {/* Middle Name (Optional) */}
            <div>
              <label htmlFor="middleName" className="sr-only">
                Middle Name (Optional)
              </label>
              <Input
                id="middleName"
                type="text"
                placeholder="Middle Name (Optional)"
                {...register('middleName')}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Password"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {/* FR-AUTH-045: Password Strength Meter */}
              {password && <PasswordStrengthMeter password={password} />}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm Password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <Checkbox
              id="acceptTerms"
              {...register('acceptTerms')}
              error={errors.acceptTerms?.message}
            />
            <label
              htmlFor="acceptTerms"
              className="ml-2 block text-sm text-gray-900"
            >
              I accept the{' '}
              <Link
                href="/terms"
                className="text-indigo-600 hover:text-indigo-500"
                target="_blank"
              >
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-indigo-600 hover:text-indigo-500"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending
                ? 'Creating account...'
                : 'Create Account'}
            </Button>
          </div>

          {/* Alternative Registration Methods */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or register with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/auth/oauth/google"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign up with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  {/* Google icon SVG path */}
                </svg>
              </Link>

              <Link
                href="/auth/oauth/microsoft"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign up with Microsoft</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  {/* Microsoft icon SVG path */}
                </svg>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/auth/register-phone"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register with phone number instead
              </Link>
            </div>
          </div>
        </form>

        {/* FR-AUTH-009: Rate Limiting Info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Registration attempts are limited to 3 per hour for security.
        </p>
      </div>
    </div>
  );
}
