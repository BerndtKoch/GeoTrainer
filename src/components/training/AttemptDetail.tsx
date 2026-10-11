'use client';

import type { ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { getCountryByCcn3 } from '@/lib/countries';
import type { AttemptRecord } from '@/lib/trainingStorage';

interface AttemptDetailProps {
  /** Oldest first, as stored. */
  attempts: AttemptRecord[];
  correctCountry: Country;
  renderAnswer: (country: Country) => ReactNode;
}

/**
 * Per-attempt breakdown of what was actually picked vs. the correct answer —
 * the detail behind a history-grid or results-review row's ✓/✗ summary.
 * Shares the exact answer rendering (text, flag, or outline) already used
 * elsewhere for the same category/direction, so a wrong flag/shape pick
 * shows as a small image here too, not just a country name.
 */
export default function AttemptDetail({ attempts, correctCountry, renderAnswer }: AttemptDetailProps) {
  if (attempts.length === 0) {
    return <p className="py-1 text-sm text-slate-400">No attempts recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-2 py-1 text-sm">
      {attempts.map((a, i) => {
        const chosen = getCountryByCcn3(a.chosenCcn3);
        return (
          <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`font-semibold ${a.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
              {a.correct ? '✓' : '✗'}
            </span>
            <span className="text-slate-400">Attempt {i + 1}:</span>
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              {chosen ? renderAnswer(chosen) : 'Unknown'}
            </span>
            {!a.correct && (
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                · Correct:
                <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                  {renderAnswer(correctCountry)}
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
