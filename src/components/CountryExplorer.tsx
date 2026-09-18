'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import WorldMap from './WorldMap';
import SearchBox from './SearchBox';
import GameFilterPicker from './GameFilterPicker';
import CountryCard from './CountryCard';
import { COUNTRIES } from '@/lib/countries';
import { GAME_BY_ID, type GameId } from '@/lib/games';
import type { Country } from '@/lib/types';

interface CountryExplorerProps {
  country: Country | null;
  game: GameId | 'all';
}

export default function CountryExplorer({ country, game }: CountryExplorerProps) {
  const router = useRouter();
  const countriesByCcn3 = useMemo(() => new Map(COUNTRIES.map((c) => [c.ccn3, c])), []);

  function selectCountry(next: Country) {
    const query = game !== 'all' ? `?for=${game}` : '';
    router.push(`/country/${next.slug}${query}`, { scroll: false });
  }

  function selectGame(next: GameId | 'all') {
    if (country) {
      router.push(`/country/${country.slug}${next !== 'all' ? `?for=${next}` : ''}`, {
        scroll: false,
      });
      return;
    }
    router.push(next === 'all' ? '/' : `/${GAME_BY_ID[next].hubSlug}`, { scroll: false });
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="flex min-h-[320px] flex-1 flex-col gap-3 lg:min-h-0">
        <SearchBox onSelect={selectCountry} />
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <WorldMap countriesByCcn3={countriesByCcn3} selected={country} onSelect={selectCountry} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-[380px] lg:shrink-0">
        <GameFilterPicker value={game} onChange={selectGame} />
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {country ? (
            <CountryCard country={country} game={game} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center text-sm text-slate-400">
              <p>Click a country on the map or search above to see its lookup card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
