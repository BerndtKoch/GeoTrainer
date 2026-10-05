import { COUNTRIES } from './countries';
import type { Country } from './types';
import { getQuestionStatsByCcn3, type Difficulty, type Strategy, type TrainingCategory } from './trainingStorage';

export type Scope = 'all' | 'Africa' | 'Asia' | 'Europe' | 'Americas' | 'Oceania';

export const SCOPES: { id: Scope; label: string }[] = [
  { id: 'all', label: 'All Regions' },
  { id: 'Africa', label: 'Africa' },
  { id: 'Asia', label: 'Asia' },
  { id: 'Europe', label: 'Europe' },
  { id: 'Americas', label: 'Americas' },
  { id: 'Oceania', label: 'Oceania' },
];

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export const STRATEGIES: { id: Strategy; label: string; description: string }[] = [
  {
    id: 'cycle',
    label: 'Even coverage',
    description: "Works through every eligible country before repeating one.",
  },
  { id: 'random', label: 'Random', description: 'Any eligible country, each time.' },
  {
    id: 'weak',
    label: 'Weak spots',
    description: "Countries you've gotten wrong more (or never been asked) come up more often.",
  },
];

const QUESTION_COUNT = 20;

/**
 * "Prominence" difficulty, per the earlier decision: reuses the population
 * bracket already computed for every country rather than curating a new
 * obscurity scale. large -> easy, medium -> medium, small -> hard.
 */
export function difficultyOf(country: Country): Difficulty {
  if (country.populationBracket === 'large') return 'easy';
  if (country.populationBracket === 'small') return 'hard';
  return 'medium';
}

export function eligibleForScope(countries: Country[], scope: Scope, difficulty: Difficulty): Country[] {
  return countries.filter((c) => (scope === 'all' || c.region === scope) && difficultyOf(c) === difficulty);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks which countries a new test will ask about, honoring the chosen
 * strategy. The pool passed in is already scope+difficulty filtered; the
 * quiz is capped to the pool's size rather than padding with repeats when
 * a narrow combination (e.g. Oceania + Easy, which today has zero eligible
 * countries) doesn't have 20 to offer.
 */
export function pickQuestionCountries(
  pool: Country[],
  strategy: Strategy,
  category: TrainingCategory,
  direction: string | null
): Country[] {
  const count = Math.min(QUESTION_COUNT, pool.length);
  if (count === 0) return [];

  if (strategy === 'random') {
    return shuffle(pool).slice(0, count);
  }

  const stats = getQuestionStatsByCcn3(category, direction);

  if (strategy === 'cycle') {
    const ranked = pool
      .map((c) => ({ c, lastSeen: stats.get(c.ccn3)?.lastTimestamp ?? 0 }))
      .sort((a, b) => a.lastSeen - b.lastSeen);
    return shuffle(ranked.slice(0, count).map((x) => x.c));
  }

  // weak: lowest percentCorrect first; never-tested countries get a neutral
  // mid-priority score so they surface before confidently-known ones but
  // don't crowd out countries you're genuinely struggling with.
  const ranked = pool
    .map((c) => ({ c, score: stats.get(c.ccn3)?.percentCorrect ?? 50 }))
    .sort((a, b) => a.score - b.score);
  return shuffle(ranked.slice(0, count).map((x) => x.c));
}

export interface QuizQuestion {
  ccn3: string;
  difficulty: Difficulty;
  answerCountry: Country;
  /** 4 countries including answerCountry, in shuffled display order. */
  optionCountries: Country[];
}

/**
 * Wrong-answer options are drawn from the full country list (not just the
 * scope/difficulty-filtered pool, which may be too small to supply 3
 * distractors on its own), preferring the answer's own region first — same
 * region is more confusable and more realistic training value, per the
 * earlier decision.
 */
function pickDistractors(answer: Country, count: number): Country[] {
  const sameRegion = shuffle(COUNTRIES.filter((c) => c.ccn3 !== answer.ccn3 && c.region === answer.region));
  const rest = shuffle(COUNTRIES.filter((c) => c.ccn3 !== answer.ccn3 && c.region !== answer.region));
  return [...sameRegion, ...rest].slice(0, count);
}

export function buildQuizQuestions(selected: Country[]): QuizQuestion[] {
  return selected.map((answerCountry) => ({
    ccn3: answerCountry.ccn3,
    difficulty: difficultyOf(answerCountry),
    answerCountry,
    optionCountries: shuffle([answerCountry, ...pickDistractors(answerCountry, 3)]),
  }));
}

export interface GroupedByRegion<T> {
  region: string;
  items: T[];
}

export function groupByRegion<T extends { region: string; name: string }>(items: T[]): GroupedByRegion<T>[] {
  const byRegion = new Map<string, T[]>();
  for (const item of items) {
    const list = byRegion.get(item.region) ?? [];
    list.push(item);
    byRegion.set(item.region, list);
  }
  return [...byRegion.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([region, list]) => ({
      region,
      items: [...list].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
