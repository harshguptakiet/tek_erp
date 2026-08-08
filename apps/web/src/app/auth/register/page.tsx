'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight,
  ArrowLeft, Loader2, Check, X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService, RegisterDto } from '@/services/auth.service';
import { toast } from 'sonner';

/* ── password strength ──────────────────────────────────── */

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? strengthColors[strength] : 'bg-[hsl(var(--border))]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength >= 4 ? 'text-emerald-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
        {strengthLabels[strength]}
      </p>

      <div className="space-y-1">
        {[
          { test: password.length >= 8, label: 'At least 8 characters' },
          { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
          { test: /[a-z]/.test(password), label: 'One lowercase letter' },
          { test: /[0-9]/.test(password), label: 'One number' },
          { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
        ].map((rule) => (
          <div key={rule.label} className="flex items-center gap-2 text-xs">
            {rule.test ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
            )}
            <span className={rule.test ? 'text-emerald-600 dark:text-emerald-400' : 'text-[hsl(var(--muted-foreground))]'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── register page ─────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDto & { confirmPassword: string; acceptTerms: boolean }>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: RegisterDto & { confirmPassword: string; acceptTerms: boolean }) => {
    try {
      const { confirmPassword, acceptTerms, ...registerData } = data;
      const response = await authService.register(registerData);
      setUser({
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        permissions: response.user.permissions,
        organizationId: response.user.organizationId,
        schoolId: response.user.schoolId,
        status: response.user.status,
      });
      setTokens({ accessToken: response.accessToken });
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error?.message || 'Please try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Branded panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-accent)' }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-12 -left-12 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-white font-[var(--font-display)]">
              Tekurious ERP
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight font-[var(--font-display)]">
            Join thousands of schools already using Tekurious
          </h2>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Get started in minutes. No credit card required. Free plan available.
          </p>

          <div className="space-y-3 pt-4">
            {[
              'Complete school management in one platform',
              'Real-time analytics & insights',
              'Multi-role support (Admin, Teacher, Student, Parent)',
              'Secure & compliant (GDPR ready)',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/50">
            © 2026 Tekurious. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
          <div className="lg:hidden text-center mb-2">
            <div
              className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-4"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight font-[var(--font-display)]">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Get started with Tekurious ERP
            </p>
          </div>

          <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">First name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="text"
                      placeholder="John"
                      className={`w-full h-11 pl-11 pr-4 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all ${errors.firstName ? 'border-red-400' : ''}`}
                      {...register('firstName', { required: 'Required' })}
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Last name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className={`w-full h-11 px-4 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all ${errors.lastName ? 'border-red-400' : ''}`}
                    {...register('lastName', { required: 'Required' })}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="email"
                    placeholder="name@school.edu"
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all ${errors.email ? 'border-red-400' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Phone <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
                    {...register('phone')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full h-11 pl-11 pr-11 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all ${errors.password ? 'border-red-400' : ''}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Min 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={watchPassword} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-0.5 h-4 w-4 rounded border-[hsl(var(--border))]"
                  {...register('acceptTerms', { required: 'You must accept the terms' })}
                />
                <label htmlFor="acceptTerms" className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-[hsl(var(--primary))] hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[hsl(var(--accent)/0.25)] active:scale-[0.98]"
                style={{ background: 'var(--gradient-accent)' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider-label my-6">or sign up with</div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6L4.8 7.8H11.4V0H24V11.4L19.2 16.2H12.6V24H11.4ZM1.2 22.8H10.2V15H18L22.8 10.2V1.2H12.6V9H5.4L1.2 13.8V22.8Z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[hsl(var(--primary))] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
