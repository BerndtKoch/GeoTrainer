'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { getQuestionStatsByCcn3, type QuestionStats, type TrainingCategory } from '@/lib/trainingStorage';

const MAX_COLUMNS = 20;

interface HistoryGridProps {
  countries: Country[];
  category: TrainingCategory;
  direction: string | null;
  renderAnswer: (country: Country) => ReactNode;
}

export default function HistoryGrid({ countries, category, direction, renderAnswer }: HistoryGridProps) {
  const [statsByCcn3, setStatsByCcn3] = useState<Map<string, QuestionStats> | null>(null);

  useEffect(() => {
    // Deferred rather than called synchronously in the effect body — this is
    // a one-time read from an external system (localStorage), not available
    // during SSR, so it has to happen after mount either way.
    queueMicrotask(() => setStatsByCcn3(getQuestionStatsByCcn3(category, direction)));
  }, [category, direction]);

  if (!statsByCcn3) return null;

  const tested = countries
    .filter((c) => statsByCcn3.has(c.ccn3))
    .map((c) => ({ country: c, stats: statsByCcn3.get(c.ccn3)! }))
    .sort((a, b) => (a.stats.percentCorrect ?? 0) - (b.stats.percentCorrect ?? 0));

  const untested = countries.filter((c) => !statsByCcn3.has(c.ccn3)).sort((a, b) => a.name.localeCompare(b.name));

  const maxVisibleColumns = Math.min(MAX_COLUMNS, Math.max(0, ...tested.map((t) => t.stats.attempts.length)));

  if (tested.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-600">
        No quiz history yet for this tab — take a quiz to start building your weak-spot grid.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60">
              <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left font-semibold whitespace-nowrap text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                Country
              </th>
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-slate-500 dark:text-slate-400">
                Answer
              </th>
              <th className="px-3 py-2 text-right font-semibold whitespace-nowrap text-slate-500 dark:text-slate-400">
                % correct
              </th>
              {Array.from({ length: maxVisibleColumns }, (_, i) => (
                <th key={i} className="px-1.5 py-2 text-center text-xs font-medium text-slate-400">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tested.map(({ country, stats }, rowIndex) => {
              const visible = stats.attempts.slice(-MAX_COLUMNS);
              return (
                <tr
                  key={country.ccn3}
                  className={rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60'}
                >
                  <td className="sticky left-0 bg-inherit px-3 py-2 font-medium whitespace-nowrap text-slate-800 dark:text-slate-100">
                    {country.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {renderAnswer(country)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-semibold whitespace-nowrap ${
                      (stats.percentCorrect ?? 0) < 50
                        ? 'text-rose-600 dark:text-rose-400'
                        : (stats.percentCorrect ?? 0) < 80
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {stats.percentCorrect}%
                  </td>
                  {Array.from({ length: maxVisibleColumns }, (_, i) => {
                    const padding = maxVisibleColumns - visible.length;
                    const value = i < padding ? null : visible[i - padding];
                    return (
                      <td key={i} className="px-1.5 py-2 text-center">
                        {value === null || value === undefined ? (
                          <span className="text-slate-200 dark:text-slate-700">&middot;</span>
                        ) : value ? (
                          <span className="font-semibold text-emerald-500">&#10003;</span>
                        ) : (
                          <span className="font-semibold text-rose-500">&#10007;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {untested.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-slate-400 uppercase">Not yet tested</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{untested.map((c) => c.name).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
