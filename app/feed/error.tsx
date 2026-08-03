'use client';

import { useEffect } from 'react';

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Feed Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-32 text-center bg-black text-white relative z-50">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Feed Crash Diagnostics</h2>
      <p className="text-gray-300 bg-gray-900 p-4 rounded-lg border border-gray-800 break-all w-full max-w-2xl font-mono text-left mb-6">
        {error.message || 'Unknown error occurred'}
      </p>
      <div className="text-xs text-gray-500 bg-black p-4 overflow-auto max-w-2xl text-left font-mono">
        {error.stack}
      </div>
      <button
        onClick={() => reset()}
        className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold"
      >
        Try Again
      </button>
    </div>
  );
}
