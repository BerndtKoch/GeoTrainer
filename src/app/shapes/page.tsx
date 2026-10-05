'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';
import CountryOutline from '@/components/CountryOutline';
import SubTabs from '@/components/training/SubTabs';
import StudyList from '@/components/training/StudyList';
import CategoryQuiz from '@/components/training/CategoryQuiz';
import HistoryGrid from '@/components/training/HistoryGrid';

type View = 'study' | 'quiz' | 'history';

export default function ShapesPage() {
  const [view, setView] = useState<View>('study');

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
          renderAnswer={(c) => <CountryOutline ccn3={c.ccn3} className="h-10 w-10 text-emerald-600" />}
        />
      )}

      {view === 'quiz' && (
        <CategoryQuiz
          category="shapes"
          countries={COUNTRIES}
          renderPrompt={(q) => <CountryOutline ccn3={q.answerCountry.ccn3} className="h-28 w-28 text-emerald-600" />}
          renderOption={(c) => c.name}
        />
      )}

      {view === 'history' && (
        <HistoryGrid
          countries={COUNTRIES}
          category="shapes"
          direction={null}
          renderAnswer={(c) => <CountryOutline ccn3={c.ccn3} className="h-8 w-8 text-emerald-600" />}
        />
      )}
    </div>
  );
}
