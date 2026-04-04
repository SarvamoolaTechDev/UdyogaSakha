'use client';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span className="text-red-500 text-xl font-bold">!</span>
      </div>
      <h2 className="font-semibold text-gray-800">Something went wrong</h2>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">
        {error.message || 'An unexpected error occurred on this page.'}
      </p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  );
}
