import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  'data-qa'?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  'data-qa': dataQa,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="label"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input',
          error && 'input-error',
          className
        )}
        data-qa={dataQa || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : 'input')}
        {...props}
      />
      {error && (
        <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--bad)' }} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>{helperText}</p>
      )}
    </div>
  );
};

