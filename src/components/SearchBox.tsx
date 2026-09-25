'use client';

import { useMemo, useRef, useState } from 'react';
import { searchCountries } from '@/lib/countries';
import { searchRegions, type Region } from '@/lib/regions';
import type { Country } from '@/lib/types';

interface SearchBoxProps {
  onSelect: (country: Country) => void;
  onSelectRegion?: (region: Region) => void;
  placeholder?: string;
}

type ResultItem = { kind: 'region'; region: Region } | { kind: 'country'; country: Country };

export default function SearchBox({ onSelect, onSelectRegion, placeholder }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const regionResults = useMemo(() => (onSelectRegion ? searchRegions(query) : []), [query, onSelectRegion]);
  const countryResults = useMemo(() => searchCountries(query), [query]);
  const results: ResultItem[] = useMemo(
    () => [
      ...regionResults.map((region): ResultItem => ({ kind: 'region', region })),
      ...countryResults.map((country): ResultItem => ({ kind: 'country', country })),
    ],
    [regionResults, countryResults]
  );

  function pick(item: ResultItem) {
    if (item.kind === 'region') {
      onSelectRegion?.(item.region);
    } else {
      onSelect(item.country);
    }
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            pick(results[activeIndex]);
          }
        }}
        placeholder={placeholder ?? 'Search a country…'}
        className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        aria-label="Search for a country"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls="country-search-results"
        aria-expanded={open && results.length > 0}
      />
      {open && results.length > 0 && (
        <ul
          id="country-search-results"
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {results.map((item, i) => {
            const key = item.kind === 'region' ? `region-${item.region.id}` : item.country.slug;
            return (
              <li key={key} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 ${
                    i === activeIndex ? 'bg-emerald-50 dark:bg-slate-700' : ''
                  }`}
                >
                  {item.kind === 'region' ? (
                    <>
                      <svg
                        className="h-4 w-4 shrink-0 text-slate-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                      >
                        <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                        <ellipse cx="10" cy="10" rx="3.1" ry="7.25" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2.75 10h14.5M3.7 6.2h12.6M3.7 13.8h12.6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.region.name}</span>
                      <span className="ml-auto text-xs text-slate-400">Region</span>
                    </>
                  ) : (
                    <>
                      <span className={`fi fi-${item.country.cca2.toLowerCase()} rounded-sm text-base`} aria-hidden />
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.country.name}</span>
                      {item.country.capital && (
                        <span className="ml-auto text-xs text-slate-400">{item.country.capital}</span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
