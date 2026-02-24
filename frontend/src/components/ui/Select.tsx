import { type FC, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  'data-qa'?: string;
  className?: string;
  id?: string;
}

export const Select: FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className,
  id,
  'data-qa': dataQa,
  ...props
}: SelectProps) => {
  const selectId = id ?? `id-select-${dataQa ?? 'select'}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
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
        data-qa={dataQa ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : 'select')}
        {...props}
      >
        {options.map((option: SelectOption) => (
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

