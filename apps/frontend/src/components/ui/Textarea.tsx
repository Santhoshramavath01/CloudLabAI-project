/**
 * PURPOSE: Multi-line text input primitive (e.g. workspace description,
 * commit message-style fields later on). Mirrors Input's label/error/hint
 * API so forms can mix the two without inconsistent styling.
 * DEPENDENCIES: react, ../../utils/cn
 */

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, rows = 4, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full resize-y rounded-lg border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
            'transition-colors duration-micro focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-base',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-status-danger focus:ring-status-danger'
              : 'border-border-strong focus:border-brand focus:ring-brand',
            className
          )}
          {...rest}
        />

        {error ? (
          <p id={`${textareaId}-error`} className="text-xs text-status-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
