'use client';

import { useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import type { QuizQuestion } from '@/lib/training';

const DIFFICULTY_STYLE: Record<QuizQuestion['difficulty'], string> = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  hard: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

interface QuizRunnerProps {
  questions: QuizQuestion[];
  renderPrompt: (q: QuizQuestion) => ReactNode;
  renderOption: (c: Country) => ReactNode;
  onAnswer: (q: QuizQuestion, chosen: Country, correct: boolean) => void;
  onFinish: (correctCount: number, total: number) => void;
  onRestart: () => void;
}

export default function QuizRunner({ questions, renderPrompt, renderOption, onAnswer, onFinish, onRestart }: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [chosenCcn3, setChosenCcn3] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-600">
        No eligible countries for that combination of scope and difficulty. Try a broader scope or a
        different tier.
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Test complete</p>
        <p className="text-4xl font-bold text-slate-900 dark:text-white">
          {correctCount} / {questions.length}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{pct}% correct</p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-3 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Take another quiz
        </button>
      </div>
    );
  }

  const question = questions[index];
  const answered = chosenCcn3 !== null;
  const isLast = index === questions.length - 1;

  function pick(option: Country) {
    if (answered) return;
    const correct = option.ccn3 === question.answerCountry.ccn3;
    setChosenCcn3(option.ccn3);
    if (correct) setCorrectCount((n) => n + 1);
    onAnswer(question, option, correct);
  }

  function next() {
    if (isLast) {
      setFinished(true);
      onFinish(correctCount, questions.length);
      return;
    }
    setIndex((i) => i + 1);
    setChosenCcn3(null);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Question {index + 1} of {questions.length}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLE[question.difficulty]}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="flex min-h-[120px] items-center justify-center py-2">{renderPrompt(question)}</div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.optionCountries.map((option) => {
          const isCorrectOption = option.ccn3 === question.answerCountry.ccn3;
          const isChosen = option.ccn3 === chosenCcn3;
          let style = 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-600 dark:hover:bg-slate-700';
          if (answered && isCorrectOption) {
            style = 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
          } else if (answered && isChosen) {
            style = 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
          } else if (answered) {
            style = 'border-slate-200 opacity-50 dark:border-slate-700';
          }
          return (
            <button
              key={option.ccn3}
              type="button"
              disabled={answered}
              onClick={() => pick(option)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
            >
              {renderOption(option)}
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          type="button"
          onClick={next}
          className="self-end rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          {isLast ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  );
}
