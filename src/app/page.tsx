import type { Metadata } from 'next';
import CountryExplorer from '@/components/CountryExplorer';
import { isGameId } from '@/lib/games';

export const metadata: Metadata = {
  title: 'GeoTrainer — Instant Country Lookup for Geography Games',
  description:
    'Click any country on the map or search by name to see its flag, capital, population, borders, and shape. A free, no-login practice companion for Worldle, Globle, Flagle, Travle, Capitalle and more.',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string }>;
}) {
  const { for: forParam } = await searchParams;
  const game = forParam && isGameId(forParam) ? forParam : 'all';

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Look up any country in seconds
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Click the map or search a country name to get its flag, capital, population, borders, and
          shape — filtered to what you actually need for your game.
        </p>
      </div>
      <div className="min-h-[600px] flex-1">
        <CountryExplorer country={null} game={game} />
      </div>
    </div>
  );
}
