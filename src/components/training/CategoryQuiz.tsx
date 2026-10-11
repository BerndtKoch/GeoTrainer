'use client';

import { useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import { buildQuizQuestions, eligibleForScope, pickQuestionCountries, type QuizQuestion } from '@/lib/training';
import { newTestId, recordAttempt, recordTestRun, type TrainingCategory } from '@/lib/trainingStorage';
import QuizSetupPanel, { type QuizSettings } from './QuizSetupPanel';
import QuizRunner from './QuizRunner';

interface CategoryQuizProps {
  category: TrainingCategory;
  countries: Country[];
  directions?: { id: string; label: string }[];
  renderPrompt: (question: QuizQuestion, direction: string | null) => ReactNode;
  renderOption: (country: Country, direction: string | null) => ReactNode;
}

export default function CategoryQuiz({ category, countries, directions, renderPrompt, renderOption }: CategoryQuizProps) {
  // settings survives a "take another quiz" (so the setup panel can be
  // pre-filled with it) — only questions/testId get cleared to go back to
  // the setup screen. "Play again" is the opposite: keeps questions as-is
  // (a literal repeat) and only bumps testId, which remounts QuizRunner
  // (keyed on it) to reset its own per-attempt state.
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [testId, setTestId] = useState<string | null>(null);

  function start(next: QuizSettings) {
    const pool = eligibleForScope(countries, next.scope);
    const selected = pickQuestionCountries(pool, next.strategy, category, next.direction);
    setSettings(next);
    setQuestions(buildQuizQuestions(selected));
    setTestId(newTestId());
  }

  function playAgain() {
    setTestId(newTestId());
  }

  function returnToSetup() {
    setQuestions(null);
    setTestId(null);
  }

  if (!settings || !questions) {
    return <QuizSetupPanel directions={directions} initialSettings={settings ?? undefined} onStart={start} />;
  }

  return (
    <QuizRunner
      key={testId}
      questions={questions}
      category={category}
      direction={settings.direction}
      renderPrompt={(q) => renderPrompt(q, settings.direction)}
      renderOption={(c) => renderOption(c, settings.direction)}
      onAnswer={(q, _chosen, correct) => {
        if (!testId) return;
        recordAttempt({
          category,
          direction: settings.direction,
          ccn3: q.ccn3,
          correct,
          testId,
        });
      }}
      onFinish={(correct, total) => {
        recordTestRun({
          category,
          direction: settings.direction,
          scope: settings.scope,
          strategy: settings.strategy,
          correct,
          total,
        });
      }}
      onPlayAgain={playAgain}
      onReturnToSetup={returnToSetup}
    />
  );
}
