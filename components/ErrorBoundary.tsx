'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-8">
          <h1 className="text-2xl text-red-500 font-bold mb-4">Feed Component Crashed!</h1>
          <p className="text-gray-300 bg-gray-900 p-4 rounded-lg border border-gray-800 break-all w-full max-w-2xl">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <pre className="text-xs text-gray-500 mt-4 overflow-auto max-w-2xl text-left bg-black p-4">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
