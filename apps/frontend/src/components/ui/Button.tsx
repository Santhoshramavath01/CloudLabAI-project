/**
 * PURPOSE: Core interactive button primitive used across the app for all
 * actions (forms, toolbars, cards, modals). Centralizes variant/size/loading
 * styling so pages never hand-roll their own <button> styles.
 * DEPENDENCIES: react, ../../utils/cn, ./Spinner
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand',
  secondary:
    'bg-surface-overlay text-text-primary hover:bg-surface-overlay/80 focus-visible:ring-border-strong',
  outline:
    'border border-border-strong text-text-primary hover:bg-surface-overlay focus-visible:ring-border-strong',
  ghost:
    'text-text-secondary hover:bg-surface-overlay hover:text-text-primary focus-visible:ring-border-strong',
  danger: 'bg-status-danger text-white hover:bg-status-danger/90 focus-visible:ring-status-danger'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-micro active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
