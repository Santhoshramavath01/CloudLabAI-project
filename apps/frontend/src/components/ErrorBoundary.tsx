/**
 * PURPOSE: Top-level React error boundary. Catches render-time errors that
 * happen outside the router's own errorElement handling (e.g. errors thrown
 * during the initial mount before routing takes over) and shows a
 * recoverable error screen instead of a blank white page.
 * DEPENDENCIES: react, ./ui
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error caught by ErrorBoundary', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-surface-base p-6">
          <div className="w-full max-w-md">
            <ErrorState
              title="CloudLab-AI hit a snag"
              description="Something broke while rendering the app. Reloading usually fixes it."
              retryLabel="Back to dashboard"
              onRetry={this.handleReset}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
