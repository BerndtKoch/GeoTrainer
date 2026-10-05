'use client';

import { useState } from 'react';
import { DIFFICULTIES, SCOPES, STRATEGIES, type Scope } from '@/lib/training';
import type { Difficulty, Strategy } from '@/lib/trainingStorage';

export interface QuizSettings {
  direction: string | null;
  scope: Scope;
  strategy: Strategy;
  difficulty: Difficulty;
}

interface QuizSetupPanelProps {
  directions?: { id: string; label: string }[];
  onStart: (settings: QuizSettings) => void;
}

export default function QuizSetupPanel({ directions, onStart }: QuizSetupPanelProps) {
  const [direction, setDirection] = useState(directions?.[0]?.id ?? null);
  const [scope, setScope] = useState<Scope>('all');
  const [strategy, setStrategy] = useState<Strategy>('cycle');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      {directions && directions.length > 1 && (
        <Field label="Direction">
          <SegmentedControl
            options={directions}
            value={direction}
            onChange={(v) => setDirection(v)}
          />
        </Field>
      )}

      <Field label="Scope">
        <SegmentedControl options={SCOPES} value={scope} onChange={(v) => setScope(v as Scope)} wrap />
      </Field>

      <Field label="Strategy">
        <div className="flex flex-col gap-1.5">
          <SegmentedControl options={STRATEGIES} value={strategy} onChange={(v) => setStrategy(v as Strategy)} />
          <p className="text-xs text-slate-400">
            {STRATEGIES.find((s) => s.id === strategy)?.description}
          </p>
        </div>
      </Field>

      <Field label="Difficulty">
        <SegmentedControl options={DIFFICULTIES} value={difficulty} onChange={(v) => setDifficulty(v as Difficulty)} />
      </Field>

      <button
        type="button"
        onClick={() => onStart({ direction, scope, strategy, difficulty })}
        className="mt-1 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        Start quiz
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</span>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  wrap,
}: {
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  wrap?: boolean;
}) {
  return (
    <div className={`flex gap-1.5 ${wrap ? 'flex-wrap' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            value === opt.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
