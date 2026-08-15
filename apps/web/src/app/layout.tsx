import './global.css';
import { QueryProvider } from '../providers/query-provider';
import { AuthProvider } from '../providers/auth-provider';
import { ThemeProvider } from '../providers/theme-provider';
import { Toaster } from '../components/ui/toast';
import { Toaster as SonnerToaster } from 'sonner';
import { AppShell } from '../components/layout/app-shell';
import { SessionTimeoutWarning } from '../components/auth/session-timeout-warning';

export const metadata = {
  title: 'Tekurious ERP — Education Management Platform',
  description:
    'Comprehensive education management platform for schools, institutions, and ed-tech organizations. Manage academics, assessments, attendance, fees, and more.',
  keywords: 'ERP, education, school management, LMS, assessment, attendance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <SessionTimeoutWarning />
              <AppShell>{children}</AppShell>
              <Toaster />
              <SonnerToaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    fontFamily: 'var(--font-sans)',
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
