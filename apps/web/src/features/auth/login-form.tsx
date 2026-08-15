'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService, LoginDto } from '@/services/auth.service';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      const response = await authService.login(data);

      // Handle 2FA required
      if ('requiresTwoFactor' in response && response.requiresTwoFactor) {
        router.push(`/auth/2fa-verify?token=${(response as any).tempToken}`);
        return;
      }

      const loginRes = response as any;
      setUser({
      setUser({
        id: loginRes.user.id,
        email: loginRes.user.email,
        firstName: loginRes.user.firstName,
        lastName: loginRes.user.lastName,
        role: loginRes.user.role,
        permissions: loginRes.user.permissions,
        organizationId: loginRes.user.organizationId || (loginRes.user.tenantId ? 'org-demo-1' : undefined),
        schoolId: loginRes.user.schoolId || (loginRes.user.tenantId ? 'school-demo-1' : undefined),
        tenantId: loginRes.user.tenantId,
        status: loginRes.user.status,
      });

      // FR-AUTH-033: Only store access token in memory via setTokens
      setTokens({ accessToken: loginRes.accessToken });

      toast.success('Welcome back!', {
        description: `Signed in as ${loginRes.user.firstName} ${loginRes.user.lastName}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      const message: string = error?.message || error?.response?.data?.message || '';

      // FR-AUTH-025: Account lockout - redirect to dedicated locked page
      if (message.toLowerCase().includes('locked') || message.toLowerCase().includes('temporarily locked')) {
        const minutesMatch = message.match(/(\d+)\s*minute/i);
        const minutes = minutesMatch ? minutesMatch[1] : null;
        const isPermanent = message.toLowerCase().includes('permanently');
        const params = new URLSearchParams();
        if (isPermanent) params.set('permanent', 'true');
        if (minutes) params.set('minutes', minutes);
        router.push(`/auth/account-locked?${params.toString()}`);
        return;
      }

      // FR-AUTH-019: Password expired - redirect to change password
      if (message.toLowerCase().includes('password has expired') || message.toLowerCase().includes('password expired')) {
        toast.error('Password Expired', {
          description: 'Your password has expired. Please set a new password to continue.',
        });
        router.push('/settings/security/password');
        return;
      }

      toast.error('Login failed', {
        description: message || 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-[hsl(var(--secondary))] p-1">
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'email'
              ? 'bg-white dark:bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('phone')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'phone'
              ? 'bg-white dark:bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Phone
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email / Phone field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {activeTab === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
            <input
              type={activeTab === 'email' ? 'email' : 'tel'}
              placeholder={activeTab === 'email' ? 'name@school.edu' : '+91 98765 43210'}
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
                pattern: activeTab === 'email'
                  ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  : undefined,
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`
                w-full h-11 pl-11 pr-11 rounded-xl border text-sm
                bg-[hsl(var(--background))] border-[hsl(var(--border))]
                placeholder:text-[hsl(var(--muted-foreground)/0.5)]
                focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                transition-all duration-200
                ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}
              `}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-[hsl(var(--muted-foreground))]">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="divider-label">or continue with</div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.4 24H0V12.6L4.8 7.8H11.4V0H24V11.4L19.2 16.2H12.6V24H11.4ZM1.2 22.8H10.2V15H18L22.8 10.2V1.2H12.6V9H5.4L1.2 13.8V22.8Z"/>
          </svg>
          Microsoft
        </button>
      </div>
    </div>
  );
}
