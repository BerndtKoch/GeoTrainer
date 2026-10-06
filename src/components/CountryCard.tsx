'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { formatArea, formatPopulation, populationBracketLabel } from '@/lib/countries';
import CountryOutline from './CountryOutline';

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({ country }: CountryCardProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-start gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        {/* `!` (important) modifier: flag-icons' own stylesheet sets
            `.fi { width: 1.333333em }`, which has the same specificity as a
            plain Tailwind width utility and silently wins the tie — this
            flag was rendering far narrower than w-28 intended until this
            was added. */}
        <span
          className={`fi fi-${country.cca2.toLowerCase()} !h-20 !w-28 shrink-0 rounded-md shadow-sm`}
          aria-label={`Flag of ${country.name}`}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">{country.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {country.region}
            {country.subregion ? ` · ${country.subregion}` : ''}
          </p>
        </div>
        <CountryOutline ccn3={country.ccn3} className="h-24 w-24 shrink-0 text-emerald-600" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 text-sm">
        <Field label="Capital">{country.capital ?? 'None'}</Field>
        <Field label="Continent / region">{country.region}</Field>
        <Field label="Population">
          {formatPopulation(country.population)}
          <span className="ml-1 text-xs text-slate-400">
            ({populationBracketLabel(country.populationBracket)})
          </span>
        </Field>
        <Field label="Borders" full>
          {country.borders.length === 0 ? (
            <span className="text-slate-400">No land borders</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {country.borders.map((b) => (
                <Link
                  key={b.slug}
                  href={`/country/${b.slug}`}
                  scroll={false}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}
        </Field>
      </dl>

      <details open className="group border-t border-slate-200 pt-3 dark:border-slate-700">
        <summary className="cursor-pointer list-none text-sm font-semibold text-emerald-700 select-none dark:text-emerald-400">
          <span className="inline-flex items-center gap-1">
            More facts
            <svg
              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </summary>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 text-sm">
          <Field label="Land area">
            {formatArea(country.area)}
            {country.areaRank && (
              <span className="ml-1 text-xs text-slate-400">(#{country.areaRank} largest)</span>
            )}
          </Field>
          <Field label="Climate">{country.climate ?? 'Unknown'}</Field>
          <Field label="Official language(s)">
            {country.languages.length ? country.languages.join(', ') : 'Unknown'}
          </Field>
          <Field label="Currency">
            {country.currencies.length
              ? country.currencies.map((c) => `${c.name} (${c.code})`).join(', ')
              : 'Unknown'}
          </Field>
          <ListField label="Major rivers" items={country.rivers} />
          <ListField label="Major mountains / peaks" items={country.mountains} />
          <ListField label="Major cities" items={country.majorCities} />
          {country.provinces.length > 0 && (
            <Field label={`States / provinces (${country.provinces.length})`} full>
              <details>
                <summary className="cursor-pointer text-emerald-700 dark:text-emerald-400">
                  Show list
                </summary>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {country.provinces.join(', ')}
                </p>
              </details>
            </Field>
          )}
          <ListField label="Notable landmarks" items={country.landmarks} />
          <ListField label="Notable brands" items={country.brands} />
          <ListField label="Signature food" items={country.food} />
        </dl>
      </details>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-0.5 text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <Field label={label}>
      {items.length ? items.join(', ') : <span className="text-slate-400">Not added yet</span>}
    </Field>
  );
}
