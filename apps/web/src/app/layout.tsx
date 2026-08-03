import './global.css';
import { QueryProvider } from '../providers/query-provider';
import { AuthProvider } from '../providers/auth-provider';
import { Toaster } from '../components/ui/toast';
import { Toaster as SonnerToaster } from 'sonner';

export const metadata = {
  title: 'Tekurious ERP - Education Management System',
  description: 'Comprehensive education management platform for schools and institutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
