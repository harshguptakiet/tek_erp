/**
 * FR-AUTH-037: Password Strength Meter
 * Calculates password strength and provides feedback
 */

export interface PasswordStrengthResult {
  score: number; // 0-4 (0=very weak, 4=very strong)
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  passesMinimum: boolean;
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang'
];

export class PasswordStrengthUtil {
  /**
   * Calculate password strength
   */
  static calculateStrength(password: string, userInfo?: { email?: string; firstName?: string; lastName?: string }): PasswordStrengthResult {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else if (password.length >= 8 && password.length < 12) {
      score += 1;
    } else if (password.length >= 12 && password.length < 16) {
      score += 2;
    } else {
      score += 3;
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(Boolean).length;

    if (!hasLowercase) feedback.push('Add lowercase letters');
    if (!hasUppercase) feedback.push('Add uppercase letters');
    if (!hasDigit) feedback.push('Add numbers');
    if (!hasSpecial) feedback.push('Add special characters (!@#$%^&*)');

    score += varietyCount;

    // Common password check
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
      feedback.push('Avoid common passwords');
      score = Math.max(0, score - 2);
    }

    // Pattern checks
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeated characters');
      score = Math.max(0, score - 1);
    }

    if (/^[0-9]+$/.test(password)) {
      feedback.push('Avoid using only numbers');
      score = Math.max(0, score - 2);
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      feedback.push('Add numbers and special characters');
      score = Math.max(0, score - 1);
    }

    // Sequential characters
    if (this.hasSequentialChars(password)) {
      feedback.push('Avoid sequential characters (abc, 123)');
      score = Math.max(0, score - 1);
    }

    // User info check
    if (userInfo) {
      if (userInfo.email && lowerPassword.includes(userInfo.email.split('@')[0].toLowerCase())) {
        feedback.push('Avoid using your email in the password');
        score = Math.max(0, score - 2);
      }
      if (userInfo.firstName && lowerPassword.includes(userInfo.firstName.toLowerCase())) {
        feedback.push('Avoid using your name in the password');
        score = Math.max(0, score - 1);
      }
      if (userInfo.lastName && lowerPassword.includes(userInfo.lastName.toLowerCase())) {
        feedback.push('Avoid using your name in the password');
        score = Math.max(0, score - 1);
      }
    }

    // Cap score at 4
    score = Math.min(4, Math.max(0, score));

    // Determine level
    let level: PasswordStrengthResult['level'];
    if (score === 0) level = 'very-weak';
    else if (score === 1) level = 'weak';
    else if (score === 2) level = 'fair';
    else if (score === 3) level = 'good';
    else level = 'strong';

    // Check if passes minimum requirements
    const passesMinimum = 
      password.length >= 8 &&
      hasLowercase &&
      hasUppercase &&
      hasDigit &&
      hasSpecial;

    if (feedback.length === 0 && score >= 3) {
      feedback.push('Strong password!');
    }

    return {
      score,
      level,
      feedback,
      passesMinimum,
    };
  }

  /**
   * Check for sequential characters
   */
  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ];

    const lower = password.toLowerCase();
    
    for (const seq of sequences) {
      for (let i = 0; i < seq.length - 2; i++) {
        const substring = seq.substring(i, i + 3);
        if (lower.includes(substring)) {
          return true;
        }
        // Check reverse
        const reverse = substring.split('').reverse().join('');
        if (lower.includes(reverse)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Validate password meets minimum requirements
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
