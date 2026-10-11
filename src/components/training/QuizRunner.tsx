'use client';

import { Fragment, useState, type ReactNode } from 'react';
import type { Country } from '@/lib/types';
import type { QuizQuestion } from '@/lib/training';
import { getQuestionStatsByCcn3, type TrainingCategory } from '@/lib/trainingStorage';
import AttemptDetail from './AttemptDetail';

const REVIEW_ATTEMPTS = 5;

interface QuizRunnerProps {
  questions: QuizQuestion[];
  category: TrainingCategory;
  direction: string | null;
  renderPrompt: (q: QuizQuestion) => ReactNode;
  renderOption: (c: Country) => ReactNode;
  onAnswer: (q: QuizQuestion, chosen: Country, correct: boolean) => void;
  onFinish: (correctCount: number, total: number) => void;
  onPlayAgain: () => void;
  onReturnToSetup: () => void;
}

export default function QuizRunner({
  questions,
  category,
  direction,
  renderPrompt,
  renderOption,
  onAnswer,
  onFinish,
  onPlayAgain,
  onReturnToSetup,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [chosenCcn3, setChosenCcn3] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
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

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-600">
        No eligible countries for that scope.
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    // Read fresh (not on mount) — by the time this renders, this quiz's own
    // attempts are already saved, so "the last 5" naturally includes the one
    // just finished. Safe to call directly rather than via useEffect: this
    // branch only ever renders after a client-side interaction, never during
    // the initial server-rendered pass, so there's no hydration-mismatch risk.
    const statsByCcn3 = getQuestionStatsByCcn3(category, direction);
    const review = questions
      .map((q) => {
        const recent = (statsByCcn3.get(q.ccn3)?.attempts ?? []).slice(-REVIEW_ATTEMPTS);
        const correctOfRecent = recent.filter((a) => a.correct).length;
        return {
          ccn3: q.ccn3,
          answerCountry: q.answerCountry,
          recent,
          percent: recent.length ? Math.round((correctOfRecent / recent.length) * 100) : null,
        };
      })
      .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0));

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Test complete</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {correctCount} / {questions.length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pct}% correct</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={onReturnToSetup}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Take another quiz
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">Click a row to see what you picked on each past attempt.</p>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-slate-500 dark:text-slate-400">
                  Country
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-medium text-slate-400" colSpan={REVIEW_ATTEMPTS}>
                  Last {REVIEW_ATTEMPTS}
                </th>
                <th className="px-3 py-2 text-right font-semibold whitespace-nowrap text-slate-500 dark:text-slate-400">
                  % of {REVIEW_ATTEMPTS}
                </th>
              </tr>
            </thead>
            <tbody>
              {review.map((row, rowIndex) => {
                const padding = REVIEW_ATTEMPTS - row.recent.length;
                const isOpen = expanded.has(row.ccn3);
                const stripe = rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60';
                return (
                  <Fragment key={row.ccn3}>
                    <tr
                      onClick={() => toggleExpanded(row.ccn3)}
                      className={`cursor-pointer ${stripe}`}
                    >
                      <td className="px-3 py-2 align-middle font-medium whitespace-nowrap text-slate-800 dark:text-slate-100">
                        <span className="mr-1.5 inline-block w-3 text-slate-400">{isOpen ? '▾' : '▸'}</span>
                        {row.answerCountry.name}
                      </td>
                      {Array.from({ length: REVIEW_ATTEMPTS }, (_, i) => {
                        const value = i < padding ? null : row.recent[i - padding];
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
                      <td className="px-3 py-2 text-right align-middle font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {row.percent}%
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className={stripe}>
                        <td className="px-3 pb-3 align-middle" colSpan={REVIEW_ATTEMPTS + 2}>
                          <AttemptDetail
                            attempts={row.recent}
                            correctCountry={row.answerCountry}
                            renderAnswer={renderOption}
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
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Question {index + 1} of {questions.length}
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
