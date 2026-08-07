/**
 * FR-AUTH-002: Phone Registration Page
 * Register with phone number and verify with OTP
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { toast } from 'sonner';

const registerPhoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name required').max(50),
  lastName: z.string().min(2, 'Last name required').max(50),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const verifyOTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'Must be numbers only'),
});

type RegisterPhoneFormData = z.infer<typeof registerPhoneSchema>;
type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;
type Step = 'register' | 'verify';

export default function RegisterPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const registerForm = useForm<RegisterPhoneFormData>({
    resolver: formResolver(registerPhoneSchema),
  });

  const verifyForm = useForm<VerifyOTPFormData>({
    resolver: formResolver(verifyOTPSchema),
  });

  const password = registerForm.watch('password');

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onRegisterSubmit = async (data: RegisterPhoneFormData) => {
    try {
      const response = await authService.registerPhone({
        phone: data.phone,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        acceptTerms: data.acceptTerms,
      });

      setPhone(data.phone);
      setTempUserId(response.user.id);
      setCountdown(600); // 10 minutes
      setStep('verify');
      toast.success('OTP sent to your phone number');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const onVerifySubmit = async (data: VerifyOTPFormData) => {
    try {
      await authService.verifyPhoneOTP(tempUserId, data.otp);
      toast.success('Phone verified successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);

      if (remaining === 0) {
        toast.error('Too many failed attempts. Please register again.');
        setStep('register');
        setAttemptsRemaining(3);
      } else {
        toast.error(`Invalid OTP. ${remaining} attempts remaining.`);
      }
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      await authService.resendPhoneOTP(tempUserId);
      setCountdown(600);
      setAttemptsRemaining(3);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'register' ? 'Register with Phone' : 'Verify Your Phone'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'register' ? (
              <>
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </>
            ) : (
              `We've sent a 6-digit code to ${phone}`
            )}
          </p>
        </div>

        {/* Registration Form */}
        {step === 'register' && (
          <form className="mt-8 space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
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
                    {...registerForm.register('firstName')}
                    error={registerForm.formState.errors.firstName?.message}
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
                    {...registerForm.register('lastName')}
                    error={registerForm.formState.errors.lastName?.message}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number (e.g., +919876543210)"
                    {...registerForm.register('phone')}
                    error={registerForm.formState.errors.phone?.message}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use E.164 format with country code (e.g., +91 for India)
                </p>
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
                    {...registerForm.register('password')}
                    error={registerForm.formState.errors.password?.message}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
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
                  {...registerForm.register('confirmPassword')}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <Checkbox
                id="acceptTerms"
                {...registerForm.register('acceptTerms')}
                error={registerForm.formState.errors.acceptTerms?.message}
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
                </Link>
              </label>
            </div>
            {registerForm.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600">
                {registerForm.formState.errors.acceptTerms.message}
              </p>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </div>

            {/* Alternative Registration */}
            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register with email instead
              </Link>
            </div>
          </form>
        )}

        {/* OTP Verification Form */}
        {step === 'verify' && (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={verifyForm.handleSubmit(onVerifySubmit)}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    {...verifyForm.register('otp')}
                    error={verifyForm.formState.errors.otp?.message}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  OTP expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Attempts Warning */}
              {attemptsRemaining < 3 && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyForm.formState.isSubmitting}
                >
                  {verifyForm.formState.isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-sm font-medium ${
                    countdown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                >
                  {countdown > 0 ? `Resend OTP in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
                </button>
              </div>

              {/* Change Phone */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setCountdown(0);
                    setAttemptsRemaining(3);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Change phone number
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rate Limiting Info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          OTP attempts are limited for security. Maximum 3 attempts allowed.
        </p>
      </div>
    </div>
  );
}
