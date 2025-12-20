'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Oops! Something went wrong.
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
        We encountered an unexpected error. You can try refreshing the page or go back to the homepage.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
