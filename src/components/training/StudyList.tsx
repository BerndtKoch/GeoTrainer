'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { groupByRegion, type Scope } from '@/lib/training';
import {
  getMnemonic,
  getQuestionStatsByCcn3AnyDirection,
  setMnemonic,
  type QuestionStats,
  type TrainingCategory,
} from '@/lib/trainingStorage';
import RegionPicker from './RegionPicker';

interface StudyListProps {
  countries: Country[];
  category: TrainingCategory;
  renderAnswer: (country: Country) => ReactNode;
}

export default function StudyList({ countries, category, renderAnswer }: StudyListProps) {
  const [mnemonics, setMnemonics] = useState<Record<string, string>>({});
  const [statsByCcn3, setStatsByCcn3] = useState<Map<string, QuestionStats> | null>(null);
  const [region, setRegion] = useState<Scope>('all');

  // Loaded after mount (not during the initial render) so the server-rendered
  // shell and the client's first paint match — localStorage doesn't exist on
  // the server, and a mismatch there would warn/break hydration.
  useEffect(() => {
    // Deferred rather than called synchronously in the effect body — this is
    // a one-time read from an external system (localStorage), not available
    // during SSR, so it has to happen after mount either way.
    queueMicrotask(() => {
      const loaded: Record<string, string> = {};
      for (const c of countries) {
        const text = getMnemonic(category, c.ccn3);
        if (text) loaded[c.ccn3] = text;
      }
      setMnemonics(loaded);
      setStatsByCcn3(getQuestionStatsByCcn3AnyDirection(category));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  function updateMnemonic(ccn3: string, text: string) {
    setMnemonics((prev) => ({ ...prev, [ccn3]: text }));
    setMnemonic(category, ccn3, text);
  }

  const filtered = region === 'all' ? countries : countries.filter((c) => c.region === region);
  const grouped = groupByRegion(filtered);

  return (
    <div className="flex flex-col gap-6">
      <RegionPicker value={region} onChange={setRegion} />
      {grouped.map((group) => (
        <div key={group.region}>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-slate-400 uppercase">{group.region}</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            {group.items.map((country, i) => {
              const percent = statsByCcn3?.get(country.ccn3)?.percentCorrect ?? null;
              return (
                <div
                  key={country.ccn3}
                  className={`flex flex-col gap-1.5 border-b border-slate-100 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-emerald-50/60 dark:border-slate-700/60 dark:hover:bg-slate-700/40 ${
                    i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{country.name}</span>
                    <div className="flex justify-center">{renderAnswer(country)}</div>
                    <div aria-hidden />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mnemonics[country.ccn3] ?? ''}
                      onChange={(e) => updateMnemonic(country.ccn3, e.target.value)}
                      placeholder="Add a memory trick…"
                      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-300 focus:border-emerald-400 focus:bg-white dark:placeholder:text-slate-600 dark:focus:bg-slate-700"
                    />
                    <span className={`shrink-0 text-xs font-semibold whitespace-nowrap ${scoreColor(percent)}`}>
                      {percent === null ? 'Not tested' : `${percent}% correct`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function scoreColor(percent: number | null): string {
  if (percent === null) return 'text-slate-300 dark:text-slate-600';
  if (percent < 50) return 'text-rose-500 dark:text-rose-400';
  if (percent < 80) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}
