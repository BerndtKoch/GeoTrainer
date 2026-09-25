'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorldMap, { type RegionFocus } from './WorldMap';
import SearchBox from './SearchBox';
import CountryCard from './CountryCard';
import { COUNTRIES } from '@/lib/countries';
import { getRegionFraming, type Region } from '@/lib/regions';
import type { GameId } from '@/lib/games';
import type { Country } from '@/lib/types';

interface CountryExplorerProps {
  country: Country | null;
  game: GameId | 'all';
}

export default function CountryExplorer({ country, game }: CountryExplorerProps) {
  const router = useRouter();
  const countriesByCcn3 = useMemo(() => new Map(COUNTRIES.map((c) => [c.ccn3, c])), []);
  const [regionFocus, setRegionFocus] = useState<RegionFocus | null>(null);

  function selectCountry(next: Country) {
    const query = game !== 'all' ? `?for=${game}` : '';
    router.push(`/country/${next.slug}${query}`, { scroll: false });
  }

  function selectRegion(region: Region) {
    const framing = getRegionFraming(region.id);
    if (!framing) return;
    setRegionFocus({ token: Date.now(), ...framing });
  }

  // Jumping to a region drives the map only — it doesn't select a country,
  // so the card falls back to its normal "click a country" prompt.
  const effectiveCountry = regionFocus ? null : country;

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="flex min-h-[320px] flex-1 flex-col gap-3 lg:min-h-0">
        <SearchBox onSelect={selectCountry} onSelectRegion={selectRegion} />
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <WorldMap
            countriesByCcn3={countriesByCcn3}
            selected={effectiveCountry}
            onSelect={selectCountry}
            regionFocus={regionFocus}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-[380px] lg:shrink-0">
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {effectiveCountry ? (
            <CountryCard country={effectiveCountry} game={game} />
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
