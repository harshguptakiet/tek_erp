/**
 * FR-AUTH-045: Password Strength Meter Component
 * Visual password strength indicator
 */

'use client';

import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  feedback: string[];
  color: string;
}

function calculatePasswordStrength(password: string): StrengthResult {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { level: 'weak', score: 0, feedback: ['Enter a password'], color: 'bg-gray-300' };
  }

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Bonus for variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 10) score += 1;

  // Check for common patterns (penalize)
  const commonPatterns = [
    /12345/, /qwerty/, /password/, /admin/, /letmein/,
    /welcome/, /monkey/, /dragon/, /master/, /football/
  ];
  if (commonPatterns.some(pattern => pattern.test(password.toLowerCase()))) {
    score -= 2;
    feedback.push('Avoid common words and patterns');
  }

  // Determine level
  let level: StrengthLevel;
  let color: string;

  if (score <= 2) {
    level = 'weak';
    color = 'bg-red-500';
  } else if (score <= 4) {
    level = 'fair';
    color = 'bg-orange-500';
  } else if (score <= 6) {
    level = 'good';
    color = 'bg-yellow-500';
  } else if (score <= 8) {
    level = 'strong';
    color = 'bg-green-500';
  } else {
    level = 'very-strong';
    color = 'bg-green-600';
  }

  return { level, score, feedback, color };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const percentage = Math.min((strength.score / 9) * 100, 100);

  return (
    <div className="mt-2 space-y-2">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Strength Label */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Password Strength:{' '}
          <span className={`capitalize ${
            strength.level === 'weak' ? 'text-red-600' :
            strength.level === 'fair' ? 'text-orange-600' :
            strength.level === 'good' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {strength.level.replace('-', ' ')}
          </span>
        </span>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Requirements Checklist */}
      <div className="text-xs space-y-1">
        <p className="font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-2 gap-1">
          <CheckItem met={password.length >= 8} text="8+ characters" />
          <CheckItem met={/[A-Z]/.test(password)} text="Uppercase letter" />
          <CheckItem met={/[a-z]/.test(password)} text="Lowercase letter" />
          <CheckItem met={/[0-9]/.test(password)} text="Number" />
          <CheckItem met={/[^A-Za-z0-9]/.test(password)} text="Special character" />
        </div>
      </div>
    </div>
  );
}

function CheckItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center">
      <span className={`mr-1 ${met ? 'text-green-600' : 'text-gray-400'}`}>
        {met ? '✓' : '○'}
      </span>
      <span className={met ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </div>
  );
}
