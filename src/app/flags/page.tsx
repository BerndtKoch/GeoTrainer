'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';
import SubTabs from '@/components/training/SubTabs';
import StudyList from '@/components/training/StudyList';
import CategoryQuiz from '@/components/training/CategoryQuiz';
import HistoryGrid from '@/components/training/HistoryGrid';

type View = 'study' | 'quiz' | 'history';

export default function FlagsPage() {
  const [view, setView] = useState<View>('study');

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Flags</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Study every national flag, quiz your recognition, and see exactly which ones you keep missing.
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
          category="flags"
          renderAnswer={(c) => <span className={`fi fi-${c.cca2.toLowerCase()} rounded-sm text-lg`} aria-hidden />}
        />
      )}

      {view === 'quiz' && (
        <CategoryQuiz
          category="flags"
          countries={COUNTRIES}
          renderPrompt={(q) => (
            <span
              className={`fi fi-${q.answerCountry.cca2.toLowerCase()} h-20 w-32 rounded-md text-6xl shadow-sm`}
              aria-label={`Flag of ${q.answerCountry.name}`}
            />
          )}
          renderOption={(c) => c.name}
        />
      )}

      {view === 'history' && (
        <HistoryGrid
          countries={COUNTRIES}
          category="flags"
          direction={null}
          renderAnswer={(c) => <span className={`fi fi-${c.cca2.toLowerCase()} rounded-sm text-base`} aria-hidden />}
        />
      )}
    </div>
  );
}
