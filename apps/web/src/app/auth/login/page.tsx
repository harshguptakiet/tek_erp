import { LoginForm } from '../../../features/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branded panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-primary)' }}
      >
        {/* Decorative shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-12 -left-12 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-2xl bg-white/5 rotate-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
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
            Transform your school management
          </h2>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            A comprehensive education platform for managing academics,
            assessments, attendance, fees, and everything in between.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: '🎓', label: 'Student Management' },
              { icon: '📊', label: 'Smart Analytics' },
              { icon: '📝', label: 'Assessment Engine' },
              { icon: '💰', label: 'Fee Management' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium text-white/90">
                  {item.label}
                </span>
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

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <div
              className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-4"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight font-[var(--font-display)]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg p-8">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-[hsl(var(--primary))] hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
