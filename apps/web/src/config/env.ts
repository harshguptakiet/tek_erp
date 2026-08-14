/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use process.env
    return process.env[key] || defaultValue || '';
  }
  // Client-side: environment variables are already embedded
  return process.env[key] || defaultValue || '';
}

// Provide sensible defaults for development
export const config = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', process.env.NODE_ENV === 'production' ? 'https://tekurious-backend.onrender.com/api/v1' : 'http://localhost:3333/api/v1'),
  socketUrl: getEnvVar('NEXT_PUBLIC_SOCKET_URL', 'ws://localhost:3333'),
  sentryDsn: getEnvVar('NEXT_PUBLIC_SENTRY_DSN'),
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
