import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-[#1D9E75]">UdyogaSakha</h1>
        <p className="text-xl text-gray-600">
          A Foundation-governed Udyoga facilitation ecosystem connecting opportunity seekers
          and providers under a transparent trust framework.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#178a64] transition-colors"
          >
            Join the Ecosystem
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
      {/* TODO: Module showcase, trust explainer, opportunity search */}
    </main>
  );
}
