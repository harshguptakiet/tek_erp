/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  socketUrl: getEnvVar('NEXT_PUBLIC_SOCKET_URL'),
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
