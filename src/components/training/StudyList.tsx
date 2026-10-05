'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { groupByRegion } from '@/lib/training';
import { getMnemonic, setMnemonic, type TrainingCategory } from '@/lib/trainingStorage';

interface StudyListProps {
  countries: Country[];
  category: TrainingCategory;
  renderAnswer: (country: Country) => ReactNode;
}

export default function StudyList({ countries, category, renderAnswer }: StudyListProps) {
  const [mnemonics, setMnemonics] = useState<Record<string, string>>({});

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  function updateMnemonic(ccn3: string, text: string) {
    setMnemonics((prev) => ({ ...prev, [ccn3]: text }));
    setMnemonic(category, ccn3, text);
  }

  const grouped = groupByRegion(countries);

  return (
    <div className="flex flex-col gap-6">
      {grouped.map((group) => (
        <div key={group.region}>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-slate-400 uppercase">{group.region}</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <tbody>
                {group.items.map((country, i) => (
                  <tr
                    key={country.ccn3}
                    className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60'}
                  >
                    <td className="px-3 py-2 align-middle font-medium whitespace-nowrap text-slate-800 dark:text-slate-100">
                      {country.name}
                    </td>
                    <td className="w-10 px-3 py-2 align-middle">{renderAnswer(country)}</td>
                    <td className="w-full px-3 py-2 align-middle">
                      <input
                        type="text"
                        value={mnemonics[country.ccn3] ?? ''}
                        onChange={(e) => updateMnemonic(country.ccn3, e.target.value)}
                        placeholder="Add a memory trick…"
                        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-300 focus:border-emerald-400 focus:bg-white dark:placeholder:text-slate-600 dark:focus:bg-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
