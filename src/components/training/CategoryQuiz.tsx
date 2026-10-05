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
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [testId, setTestId] = useState<string | null>(null);

  function start(next: QuizSettings) {
    const pool = eligibleForScope(countries, next.scope, next.difficulty);
    const selected = pickQuestionCountries(pool, next.strategy, category, next.direction);
    setSettings(next);
    setQuestions(buildQuizQuestions(selected));
    setTestId(newTestId());
  }

  function restart() {
    setSettings(null);
    setQuestions(null);
    setTestId(null);
  }

  if (!settings || !questions) {
    return <QuizSetupPanel directions={directions} onStart={start} />;
  }

  return (
    <QuizRunner
      questions={questions}
      renderPrompt={(q) => renderPrompt(q, settings.direction)}
      renderOption={(c) => renderOption(c, settings.direction)}
      onAnswer={(q, _chosen, correct) => {
        if (!testId) return;
        recordAttempt({
          category,
          direction: settings.direction,
          ccn3: q.ccn3,
          correct,
          difficulty: q.difficulty,
          testId,
        });
      }}
      onFinish={(correct, total) => {
        recordTestRun({
          category,
          direction: settings.direction,
          scope: settings.scope,
          strategy: settings.strategy,
          difficulty: settings.difficulty,
          correct,
          total,
        });
      }}
      onRestart={restart}
    />
  );
}
