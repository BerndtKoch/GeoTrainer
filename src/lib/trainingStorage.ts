'use client';

export type TrainingCategory = 'capitals' | 'flags' | 'shapes';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Strategy = 'cycle' | 'random' | 'weak';

export interface AttemptEvent {
  id: string;
  category: TrainingCategory;
  /** Only meaningful for capitals (its two directions are different skills). */
  direction: string | null;
  ccn3: string;
  correct: boolean;
  difficulty: Difficulty;
  timestamp: number;
  testId: string;
}

export interface TestRunSummary {
  id: string;
  category: TrainingCategory;
  direction: string | null;
  scope: string;
  strategy: Strategy;
  difficulty: Difficulty;
  correct: number;
  total: number;
  completedAt: number;
}

interface MnemonicEntry {
  text: string;
  updatedAt: number;
}

const ATTEMPTS_KEY = 'geotrainer.training.v1.attempts';
const TEST_RUNS_KEY = 'geotrainer.training.v1.testRuns';
const MNEMONICS_KEY = 'geotrainer.training.v1.mnemonics';

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — nothing else to
    // do client-side; the app just won't remember this write.
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newTestId(): string {
  return newId();
}

export function recordAttempt(input: Omit<AttemptEvent, 'id' | 'timestamp'>): void {
  const all = readJSON<AttemptEvent[]>(ATTEMPTS_KEY, []);
  all.push({ ...input, id: newId(), timestamp: Date.now() });
  writeJSON(ATTEMPTS_KEY, all);
}

export function recordTestRun(input: Omit<TestRunSummary, 'id' | 'completedAt'>): void {
  const all = readJSON<TestRunSummary[]>(TEST_RUNS_KEY, []);
  all.push({ ...input, id: newId(), completedAt: Date.now() });
  writeJSON(TEST_RUNS_KEY, all);
}

export function getAttempts(category: TrainingCategory, direction: string | null = null): AttemptEvent[] {
  return readJSON<AttemptEvent[]>(ATTEMPTS_KEY, []).filter(
    (a) => a.category === category && a.direction === direction
  );
}

export function getTestRuns(category: TrainingCategory, direction: string | null = null): TestRunSummary[] {
  return readJSON<TestRunSummary[]>(TEST_RUNS_KEY, []).filter(
    (r) => r.category === category && r.direction === direction
  );
}

export function getMnemonic(category: TrainingCategory, ccn3: string): string {
  const all = readJSON<Record<string, MnemonicEntry>>(MNEMONICS_KEY, {});
  return all[`${category}:${ccn3}`]?.text ?? '';
}

export function setMnemonic(category: TrainingCategory, ccn3: string, text: string): void {
  const all = readJSON<Record<string, MnemonicEntry>>(MNEMONICS_KEY, {});
  const key = `${category}:${ccn3}`;
  if (text.trim() === '') {
    delete all[key];
  } else {
    all[key] = { text, updatedAt: Date.now() };
  }
  writeJSON(MNEMONICS_KEY, all);
}

export interface QuestionStats {
  ccn3: string;
  /** Chronological order, oldest first — true means that attempt was correct. */
  attempts: boolean[];
  correctCount: number;
  totalCount: number;
  /** Null when the question has never been asked. */
  percentCorrect: number | null;
  lastTimestamp: number;
}

/**
 * Every attempt ever made, aggregated per country — the basis for both the
 * history grid (which shows the full, uncapped attempt list per row) and the
 * quiz-generation strategies (cycle picks the longest-untested; weak picks
 * the lowest percentCorrect). Nothing here is pruned: the data is small
 * enough (a season of daily quizzing is well under a megabyte as JSON) that
 * capping storage isn't worth the complexity — only the grid's rendered
 * columns are capped, at render time, not here.
 */
export function getQuestionStatsByCcn3(
  category: TrainingCategory,
  direction: string | null = null
): Map<string, QuestionStats> {
  const events = getAttempts(category, direction).sort((a, b) => a.timestamp - b.timestamp);
  const map = new Map<string, QuestionStats>();
  for (const e of events) {
    let stats = map.get(e.ccn3);
    if (!stats) {
      stats = { ccn3: e.ccn3, attempts: [], correctCount: 0, totalCount: 0, percentCorrect: null, lastTimestamp: 0 };
      map.set(e.ccn3, stats);
    }
    stats.attempts.push(e.correct);
    stats.totalCount += 1;
    if (e.correct) stats.correctCount += 1;
    stats.lastTimestamp = e.timestamp;
  }
  for (const stats of map.values()) {
    stats.percentCorrect = stats.totalCount > 0 ? Math.round((stats.correctCount / stats.totalCount) * 100) : null;
  }
  return map;
}
