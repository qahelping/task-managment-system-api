import React from 'react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  'data-qa'?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className,
  id,
  'data-qa': dataQa,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="label"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'input-modern',
          error ? 'input-error' : '',
          className
        )}
        data-qa={dataQa || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : 'select')}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="input-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="input-helper-text">{helperText}</p>
      )}
    </div>
  );
};

