const isProduction = process.env.NODE_ENV === 'production';

/** Relaxed limits in development to allow automated testing */
export const authThrottle = {
  register: isProduction
    ? { short: { limit: 3, ttl: 600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  login: isProduction
    ? { short: { limit: 5, ttl: 60_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  forgotPassword: isProduction
    ? { short: { limit: 3, ttl: 3_600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  resetPassword: isProduction
    ? { short: { limit: 5, ttl: 3_600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  resendVerification: isProduction
    ? { short: { limit: 3, ttl: 3_600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  phoneOtp: isProduction
    ? { short: { limit: 3, ttl: 3_600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
  phoneRegister: isProduction
    ? { short: { limit: 3, ttl: 600_000 } }
    : { short: { limit: 200, ttl: 60_000 } },
};
