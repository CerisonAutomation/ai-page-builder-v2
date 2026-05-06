/**
 * 404 Not Found Error Page
 * Displays when a page doesn't exist
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-6 py-12 max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</p>
          <p className="text-slate-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/edit"
            className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Create Page
          </Link>
        </div>

        <p className="text-sm text-slate-500 mt-12">
          Error code: <code className="bg-slate-200 px-2 py-1 rounded">404</code>
        </p>
      </div>
    </div>
  );
}
