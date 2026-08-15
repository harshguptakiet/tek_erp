/**
 * Password Strength Utility
 * FR-AUTH-037: Password strength meter with real-time feedback
 */

export interface PasswordStrengthResult {
  score: number; // 0-4
  strength: 'VERY_WEAK' | 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';
  feedback: string[];
  passesMinimum: boolean;
}

export interface PasswordContext {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export class PasswordStrengthUtil {
  /**
   * Calculate password strength with detailed feedback
   */
  static calculateStrength(password: string, context?: PasswordContext): PasswordStrengthResult {
    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety scoring
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    if (varietyCount >= 3) score++;
    if (varietyCount === 4) score++;

    // Penalty for common patterns
    if (/^(?:12345|password|qwerty|abc123|letmein)/i.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common passwords like "password" or "12345"');
    }

    // Penalty for sequential characters
    if (/(?:abc|bcd|cde|123|234|345|678|789)/i.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid sequential characters like "123" or "abc"');
    }

    // Penalty for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid repeating characters like "aaa" or "111"');
    }

    // Context-based checks (similarity to email/name)
    if (context) {
      if (context.email) {
        const emailLocal = context.email.split('@')[0].toLowerCase();
        if (password.toLowerCase().includes(emailLocal) && emailLocal.length > 3) {
          score = Math.max(0, score - 1);
          feedback.push('Password should not contain parts of your email');
        }
      }

      if (context.firstName && context.firstName.length > 2) {
        if (password.toLowerCase().includes(context.firstName.toLowerCase())) {
          score = Math.max(0, score - 1);
          feedback.push('Password should not contain your first name');
        }
      }

      if (context.lastName && context.lastName.length > 2) {
        if (password.toLowerCase().includes(context.lastName.toLowerCase())) {
          score = Math.max(0, score - 1);
          feedback.push('Password should not contain your last name');
        }
      }
    }

    // Cap score at 4
    score = Math.min(4, Math.max(0, score));

    // Determine strength level
    let strength: PasswordStrengthResult['strength'];
    if (score === 0) {
      strength = 'VERY_WEAK';
      feedback.unshift('Password is very weak');
    } else if (score === 1) {
      strength = 'WEAK';
      feedback.unshift('Password is weak');
    } else if (score === 2) {
      strength = 'FAIR';
      feedback.unshift('Password is fair');
    } else if (score === 3) {
      strength = 'GOOD';
      feedback.unshift('Password is good');
    } else {
      strength = 'STRONG';
      feedback.unshift('Password is strong');
    }

    // Add constructive feedback for weak passwords
    if (score < 3) {
      if (password.length < 12) {
        feedback.push('Use at least 12 characters for better security');
      }
      if (!hasUppercase) {
        feedback.push('Add uppercase letters (A-Z)');
      }
      if (!hasLowercase) {
        feedback.push('Add lowercase letters (a-z)');
      }
      if (!hasNumbers) {
        feedback.push('Add numbers (0-9)');
      }
      if (!hasSpecialChars) {
        feedback.push('Add special characters (!@#$%^&*)');
      }
    }

    // Minimum acceptable is FAIR (score >= 2)
    const passesMinimum = score >= 2;

    return {
      score,
      strength,
      feedback,
      passesMinimum,
    };
  }

  /**
   * Get visual color for strength level
   */
  static getStrengthColor(strength: PasswordStrengthResult['strength']): string {
    switch (strength) {
      case 'VERY_WEAK':
        return '#dc2626'; // red-600
      case 'WEAK':
        return '#ea580c'; // orange-600
      case 'FAIR':
        return '#f59e0b'; // amber-500
      case 'GOOD':
        return '#22c55e'; // green-500
      case 'STRONG':
        return '#16a34a'; // green-600
      default:
        return '#9ca3af'; // gray-400
    }
  }

  /**
   * Get progress percentage (0-100)
   */
  static getStrengthPercentage(score: number): number {
    return (score / 4) * 100;
  }
}
