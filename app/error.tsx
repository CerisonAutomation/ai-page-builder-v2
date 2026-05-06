/**
 * Error Boundary Page
 * Displays when an unexpected server error occurs
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/utils/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to service for monitoring
    logger.error("Error boundary caught error", error, { digest: error?.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center px-6 py-12 max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-red-600 mb-4">500</h1>
          <p className="text-3xl font-bold text-slate-900 mb-2">Something Went Wrong</p>
          <p className="text-slate-600 mb-8">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {error?.digest && (
          <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded mb-6 break-all">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>

        <p className="text-sm text-slate-500 mt-12">
          Error code: <code className="bg-slate-200 px-2 py-1 rounded">500</code>
        </p>
      </div>
    </div>
  );
}
