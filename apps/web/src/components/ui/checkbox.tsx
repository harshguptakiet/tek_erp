/**
 * Checkbox UI Component
 */

'use client';

import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  error?: string;
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, id, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex flex-col">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={id}
            className={`
              h-4 w-4 rounded border-gray-300 text-indigo-600 
              focus:ring-indigo-500 focus:ring-2 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${error ? 'border-red-500' : ''}
              ${className || ''}
            `}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
          {label && (
            <label
              htmlFor={id}
              className="ml-2 block text-sm text-gray-900 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
