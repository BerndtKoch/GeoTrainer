'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';
import SubTabs from '@/components/training/SubTabs';
import StudyList from '@/components/training/StudyList';
import CategoryQuiz from '@/components/training/CategoryQuiz';
import HistoryGrid from '@/components/training/HistoryGrid';

type View = 'study' | 'quiz' | 'history';
type FlagsDirection = 'flag-to-country' | 'country-to-flag';

const DIRECTIONS: { id: FlagsDirection; label: string }[] = [
  { id: 'flag-to-country', label: 'Flag → Country' },
  { id: 'country-to-flag', label: 'Country → Flag' },
];

function FlagSwatch({ cca2, className }: { cca2: string; className: string }) {
  // Sizing uses the `!` (important) modifier because flag-icons' own
  // stylesheet sets `.fi { width: 1.333333em }` — a plain Tailwind width
  // utility has the same specificity and silently loses that tie.
  return <span className={`fi fi-${cca2.toLowerCase()} rounded-md ${className}`} aria-hidden />;
}

export default function FlagsPage() {
  const [view, setView] = useState<View>('study');
  const [historyDirection, setHistoryDirection] = useState<FlagsDirection>('flag-to-country');

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
          renderAnswer={(c) => <FlagSwatch cca2={c.cca2} className="!h-[54px] !w-[72px]" />}
        />
      )}

      {view === 'quiz' && (
        <CategoryQuiz
          category="flags"
          countries={COUNTRIES}
          directions={DIRECTIONS}
          renderPrompt={(q, direction) =>
            direction === 'country-to-flag' ? (
              <p className="text-center text-2xl font-bold text-slate-900 dark:text-white">
                {q.answerCountry.name}
              </p>
            ) : (
              <FlagSwatch
                cca2={q.answerCountry.cca2}
                className="!h-32 !w-52 shadow-sm sm:!h-48 sm:!w-80 lg:!h-80 lg:!w-[32rem]"
              />
            )
          }
          renderOption={(c, direction) =>
            direction === 'country-to-flag' ? <FlagSwatch cca2={c.cca2} className="!h-12 !w-20" /> : c.name
          }
        />
      )}

      {view === 'history' && (
        <div className="flex flex-col gap-4">
          <SubTabs options={DIRECTIONS} value={historyDirection} onChange={setHistoryDirection} />
          <HistoryGrid
            countries={COUNTRIES}
            category="flags"
            direction={historyDirection}
            renderAnswer={(c) => <FlagSwatch cca2={c.cca2} className="!h-12 !w-16" />}
          />
        </div>
      )}
    </div>
  );
}
