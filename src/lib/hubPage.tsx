import type { Metadata } from 'next';
import CountryExplorer from '@/components/CountryExplorer';
import { GAME_BY_ID, type GameId } from '@/lib/games';

export function hubMetadata(id: GameId): Metadata {
  const g = GAME_BY_ID[id];
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: `/${g.hubSlug}` },
    openGraph: { title: g.metaTitle, description: g.metaDescription },
  };
}

export function HubPage({ id }: { id: GameId }) {
  const g = GAME_BY_ID[id];
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {g.name} practice: {g.tagline.toLowerCase()}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{g.intro}</p>
      </div>
      <div className="min-h-[600px] flex-1">
        <CountryExplorer country={null} game={id} />
      </div>
    </div>
  );
}
