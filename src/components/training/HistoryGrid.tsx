'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { getQuestionStatsByCcn3, type QuestionStats, type TrainingCategory } from '@/lib/trainingStorage';
import type { Scope } from '@/lib/training';
import RegionPicker from './RegionPicker';
import AttemptDetail from './AttemptDetail';

const MAX_COLUMNS = 20;
const REVIEW_ATTEMPTS = 5;

interface HistoryGridProps {
  countries: Country[];
  category: TrainingCategory;
  direction: string | null;
  renderAnswer: (country: Country) => ReactNode;
}

export default function HistoryGrid({ countries, category, direction, renderAnswer }: HistoryGridProps) {
  const [statsByCcn3, setStatsByCcn3] = useState<Map<string, QuestionStats> | null>(null);
  const [region, setRegion] = useState<Scope>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(ccn3: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ccn3)) {
        next.delete(ccn3);
      } else {
        next.add(ccn3);
      }
      return next;
    });
  }

  useEffect(() => {
    // Deferred rather than called synchronously in the effect body — this is
    // a one-time read from an external system (localStorage), not available
    // during SSR, so it has to happen after mount either way.
    queueMicrotask(() => setStatsByCcn3(getQuestionStatsByCcn3(category, direction)));
  }, [category, direction]);

  if (!statsByCcn3) return null;

  const scoped = region === 'all' ? countries : countries.filter((c) => c.region === region);

  const tested = scoped
    .filter((c) => statsByCcn3.has(c.ccn3))
    .map((c) => ({ country: c, stats: statsByCcn3.get(c.ccn3)! }))
    .sort((a, b) => (a.stats.percentCorrect ?? 0) - (b.stats.percentCorrect ?? 0));

  const untested = scoped.filter((c) => !statsByCcn3.has(c.ccn3)).sort((a, b) => a.name.localeCompare(b.name));

  const maxVisibleColumns = Math.min(MAX_COLUMNS, Math.max(0, ...tested.map((t) => t.stats.attempts.length)));

  if (tested.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <RegionPicker value={region} onChange={setRegion} />
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-600">
          No quiz history yet for this tab and region — take a quiz to start building your weak-spot grid.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <RegionPicker value={region} onChange={setRegion} />
      <p className="text-xs text-slate-400">Click a row to see what you picked on each past attempt.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
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
              const isOpen = expanded.has(country.ccn3);
              const stripe = rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60';
              return (
                <Fragment key={country.ccn3}>
                  <tr
                    onClick={() => toggleExpanded(country.ccn3)}
                    className={`cursor-pointer transition-colors hover:bg-emerald-50/60 dark:hover:bg-slate-700/40 ${stripe}`}
                  >
                    <td className="sticky left-0 bg-inherit px-3 py-2 align-middle font-medium whitespace-nowrap text-slate-800 dark:text-slate-100">
                      <span className="mr-1.5 inline-block w-3 text-slate-400">{isOpen ? '▾' : '▸'}</span>
                      {country.name}
                    </td>
                    <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {renderAnswer(country)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right align-middle font-semibold whitespace-nowrap ${
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
                        <td key={i} className="px-1.5 py-2 text-center align-middle">
                          {value === null || value === undefined ? (
                            <span className="text-slate-200 dark:text-slate-700">&middot;</span>
                          ) : value.correct ? (
                            <span className="font-semibold text-emerald-500">&#10003;</span>
                          ) : (
                            <span className="font-semibold text-rose-500">&#10007;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {isOpen && (
                    <tr className={stripe}>
                      <td className="px-3 pb-3 align-middle" colSpan={3 + maxVisibleColumns}>
                        <AttemptDetail
                          attempts={stats.attempts.slice(-REVIEW_ATTEMPTS)}
                          correctCountry={country}
                          renderAnswer={renderAnswer}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
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
