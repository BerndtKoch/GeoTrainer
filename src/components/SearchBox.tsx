'use client';

import { useMemo, useRef, useState } from 'react';
import { searchCountries } from '@/lib/countries';
import type { Country } from '@/lib/types';

interface SearchBoxProps {
  onSelect: (country: Country) => void;
  placeholder?: string;
}

export default function SearchBox({ onSelect, placeholder }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchCountries(query), [query]);

  function pick(country: Country) {
    onSelect(country);
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
          {results.map((c, i) => (
            <li key={c.slug} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 ${
                  i === activeIndex ? 'bg-emerald-50 dark:bg-slate-700' : ''
                }`}
              >
                <span className={`fi fi-${c.cca2.toLowerCase()} rounded-sm text-base`} aria-hidden />
                <span className="font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
                {c.capital && (
                  <span className="ml-auto text-xs text-slate-400">{c.capital}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
