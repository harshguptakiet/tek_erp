/**
 * Password Validation Utility
 * Implements FR-AUTH-001 password policy requirements
 */

import { BadRequestException } from '@nestjs/common';

// Top 10,000 most common passwords (sample - full list would be loaded from file)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123', 'admin', 'welcome',
  // ... would include all 10,000
]);

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG';
}

export class PasswordValidator {
  /**
   * Validate password against policy requirements
   * Requirements:
   * - Min 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   * - At least 1 special character
   * - Not in common password list
   * - Not similar to email/name
   */
  static validate(
    password: string,
    email?: string,
    firstName?: string,
    lastName?: string,
  ): PasswordValidationResult {
    const errors: string[] = [];

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password check
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    // Email similarity check
    if (email) {
      const emailUsername = email.split('@')[0].toLowerCase();
      if (password.toLowerCase().includes(emailUsername)) {
        errors.push('Password cannot contain parts of your email address');
      }
    }

    // Name similarity check
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
      errors.push('Password cannot contain your first name');
    }
    if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
      errors.push('Password cannot contain your last name');
    }

    // Calculate strength
    const strength = this.calculateStrength(password);

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Calculate password strength
   */
  static calculateStrength(password: string): 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG' {
    let score = 0;

    // Length score
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Complexity bonus
    const hasMultipleUppercase = (password.match(/[A-Z]/g) || []).length >= 2;
    const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2;
    const hasMultipleSpecial = (password.match(/[^a-zA-Z0-9]/g) || []).length >= 2;

    if (hasMultipleUppercase) score += 1;
    if (hasMultipleNumbers) score += 1;
    if (hasMultipleSpecial) score += 1;

    // Map score to strength
    if (score <= 3) return 'WEAK';
    if (score <= 5) return 'FAIR';
    if (score <= 7) return 'GOOD';
    if (score <= 9) return 'STRONG';
    return 'VERY_STRONG';
  }

  /**
   * Check if new password is in user's password history
   */
  static async isInPasswordHistory(
    newPassword: string,
    passwordHashes: string[],
  ): Promise<boolean> {
    const bcrypt = require('bcrypt');
    
    for (const hash of passwordHashes) {
      const matches = await bcrypt.compare(newPassword, hash);
      if (matches) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate and throw if password doesn't meet requirements
   */
  static validateOrThrow(
    password: string,
    email?: string,
    firstName?: string,
    lastName?: string,
  ): void {
    const result = this.validate(password, email, firstName, lastName);
    
    if (!result.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: result.errors,
      });
    }

    if (result.strength === 'WEAK') {
      throw new BadRequestException({
        message: 'Password is too weak. Please choose a stronger password',
        strength: result.strength,
      });
    }
  }
}
