/**
 * PURPOSE: Core text input primitive for forms (login, register, workspace
 * creation, settings). Supports label/error/hint text and left/right icons
 * so pages never hand-roll bare <input> elements.
 * DEPENDENCIES: react, ../../utils/cn
 */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'h-10 w-full rounded-lg border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors duration-micro focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-base',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-status-danger focus:ring-status-danger'
                : 'border-border-strong focus:border-brand focus:ring-brand',
              Boolean(leftIcon) && 'pl-9',
  Boolean(rightIcon) && 'pr-9',
              className
            )}
            {...rest}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{rightIcon}</span>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-status-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
