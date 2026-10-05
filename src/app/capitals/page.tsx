'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';
import SubTabs from '@/components/training/SubTabs';
import StudyList from '@/components/training/StudyList';
import CategoryQuiz from '@/components/training/CategoryQuiz';
import HistoryGrid from '@/components/training/HistoryGrid';

type View = 'study' | 'quiz' | 'history';
type CapitalsDirection = 'country-to-capital' | 'capital-to-country';

const DIRECTIONS: { id: CapitalsDirection; label: string }[] = [
  { id: 'country-to-capital', label: 'Country → Capital' },
  { id: 'capital-to-country', label: 'Capital → Country' },
];

export default function CapitalsPage() {
  const [view, setView] = useState<View>('study');
  const [historyDirection, setHistoryDirection] = useState<CapitalsDirection>('country-to-capital');

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Capitals</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Study every country&apos;s capital, quiz yourself in either direction, and see exactly which ones you
          keep missing.
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
        <StudyList countries={COUNTRIES} category="capitals" renderAnswer={(c) => <span>{c.capital}</span>} />
      )}

      {view === 'quiz' && (
        <CategoryQuiz
          category="capitals"
          countries={COUNTRIES}
          directions={DIRECTIONS}
          renderPrompt={(q, direction) => (
            <p className="text-center text-2xl font-bold text-slate-900 dark:text-white">
              {direction === 'capital-to-country' ? q.answerCountry.capital : q.answerCountry.name}
            </p>
          )}
          renderOption={(c, direction) => (direction === 'capital-to-country' ? c.name : c.capital)}
        />
      )}

      {view === 'history' && (
        <div className="flex flex-col gap-4">
          <SubTabs options={DIRECTIONS} value={historyDirection} onChange={setHistoryDirection} />
          <HistoryGrid
            countries={COUNTRIES}
            category="capitals"
            direction={historyDirection}
            renderAnswer={(c) => (historyDirection === 'capital-to-country' ? c.name : c.capital)}
          />
        </div>
      )}
    </div>
  );
}
