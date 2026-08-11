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
    console.error('[MoonFluxx Error Boundary]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center font-mono p-8 bg-[#050510] text-white">
          <div className="max-w-md w-full p-8 border-2 border-[rgba(255,255,255,0.2)] bg-[#0a0a1a] shadow-[6px_6px_0px_0px_#F43F5E]">
            <div className="text-4xl mb-4">💥</div>
            <h1 className="text-xl font-black uppercase tracking-wider mb-2">
              [ SYSTEM_CRASH.EXE ]
            </h1>
            <p className="text-sm mb-4 text-gray-400">
              Something went wrong. Don&apos;t worry — your funds are safe.
            </p>
            <pre className="text-[10px] p-3 mb-6 overflow-auto max-h-32 bg-[#050510] border border-[rgba(255,255,255,0.1)]">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="w-full py-3 font-black uppercase text-sm tracking-widest bg-[#10B981] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              [ REBOOT → HOME ]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
