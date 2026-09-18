import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="text-2xl font-bold">Country not found</h1>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        We couldn&apos;t find that country. Try searching from the homepage instead.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Back to the map
      </Link>
    </div>
  );
}
