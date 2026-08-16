/**
 * PURPOSE: Styled native <select> primitive for simple choice fields
 * (e.g. workspace template, region). Uses a real <select> rather than a
 * custom listbox for built-in keyboard/a11y/mobile support; Dropdown
 * covers cases that need rich custom menu content.
 * DEPENDENCIES: react, lucide-react, ../../utils/cn
 */

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border bg-surface-raised pl-3 pr-9 text-sm text-text-primary',
              'transition-colors duration-micro focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-base',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-status-danger focus:ring-status-danger'
                : 'border-border-strong focus:border-brand focus:ring-brand',
              className
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>

        {error ? (
          <p id={`${selectId}-error`} className="text-xs text-status-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
