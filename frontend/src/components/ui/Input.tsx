import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full px-3 py-2 text-sm rounded-md border bg-white text-gray-900 placeholder-gray-400',
                'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'transition-shadow duration-150',
                icon && 'pl-9',
                error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>}
        {helpText && !error && <p className="text-xs text-gray-500 mt-0.5">{helpText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
