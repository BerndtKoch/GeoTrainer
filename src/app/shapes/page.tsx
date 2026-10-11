'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';
import CountryOutline from '@/components/CountryOutline';
import SubTabs from '@/components/training/SubTabs';
import StudyList from '@/components/training/StudyList';
import CategoryQuiz from '@/components/training/CategoryQuiz';
import HistoryGrid from '@/components/training/HistoryGrid';

type View = 'study' | 'quiz' | 'history';
type ShapesDirection = 'shape-to-country' | 'country-to-shape';

const DIRECTIONS: { id: ShapesDirection; label: string }[] = [
  { id: 'shape-to-country', label: 'Shape → Country' },
  { id: 'country-to-shape', label: 'Country → Shape' },
];

export default function ShapesPage() {
  const [view, setView] = useState<View>('study');
  const [historyDirection, setHistoryDirection] = useState<ShapesDirection>('shape-to-country');

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shapes / Maps</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Study every country outline, quiz your recognition, and see exactly which shapes you keep missing.
        </p>
      </div>

      <SubTabs
        options={[
          { id: 'study', label: 'Study list' },
          { id: 'quiz', label: 'Take a quiz' },
          { id: 'history', label: 'History' },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'study' && (
        <StudyList
          countries={COUNTRIES}
          category="shapes"
          renderAnswer={(c) => <CountryOutline ccn3={c.ccn3} className="h-20 w-20 text-emerald-600" />}
        />
      )}

      {view === 'quiz' && (
        <CategoryQuiz
          category="shapes"
          countries={COUNTRIES}
          directions={DIRECTIONS}
          renderPrompt={(q, direction) =>
            direction === 'country-to-shape' ? (
              <p className="text-center text-2xl font-bold text-slate-900 dark:text-white">
                {q.answerCountry.name}
              </p>
            ) : (
              <CountryOutline ccn3={q.answerCountry.ccn3} className="h-28 w-28 text-emerald-600" />
            )
          }
          renderOption={(c, direction) =>
            direction === 'country-to-shape' ? (
              <CountryOutline ccn3={c.ccn3} className="h-24 w-24 text-emerald-600 sm:h-28 sm:w-28" />
            ) : (
              c.name
            )
          }
        />
      )}

      {view === 'history' && (
        <div className="flex flex-col gap-4">
          <SubTabs options={DIRECTIONS} value={historyDirection} onChange={setHistoryDirection} />
          <HistoryGrid
            countries={COUNTRIES}
            category="shapes"
            direction={historyDirection}
            renderAnswer={(c) => <CountryOutline ccn3={c.ccn3} className="h-8 w-8 text-emerald-600" />}
          />
        </div>
      )}
    </div>
  );
}
