import type { FieldKey } from './types';

export type GameId =
  | 'worldle'
  | 'globle'
  | 'flagle'
  | 'capitalle'
  | 'travle'
  | 'countryle'
  | 'citydle'
  | 'brandle'
  | 'seterra'
  | 'globo';

export interface GameDef {
  id: GameId;
  name: string;
  /** Route slug for the hub page: /worldle-practice */
  hubSlug: string;
  tagline: string;
  /** One paragraph of independent, non-affiliated framing for the hub page. */
  intro: string;
  metaTitle: string;
  metaDescription: string;
  /** Phase 1 games get a picker chip + hub page at launch. */
  phase: 1 | 2;
}

// Ordered by a best-guess at relative popularity (no real traffic data yet —
// revisit once the site has some). Drives the header's game-context switcher:
// the games most likely to be someone's actual reason for visiting sit first,
// so they need the least scrolling to reach on a phone-width screen.
export const GAMES: GameDef[] = [
  {
    id: 'worldle',
    name: 'Worldle',
    hubSlug: 'worldle-practice',
    tagline: 'Country shape, capital & language lookup',
    intro:
      'Worldle shows you a country silhouette and scores your guesses by distance and direction. Use this practice tool to study country outlines, capitals, and official languages so shapes become easier to recognize.',
    metaTitle: 'Worldle Practice Tool — Country Shape & Capital Lookup',
    metaDescription:
      'A free practice tool for Worldle players: browse country outlines, capitals, and languages on an interactive map. Not affiliated with Worldle.',
    phase: 1,
  },
  {
    id: 'flagle',
    name: 'Flagle',
    hubSlug: 'flagle-practice',
    tagline: 'Flag lookup',
    intro:
      'Flagle reveals a national flag piece by piece. Browse every country’s flag here to sharpen your flag recognition before your next round.',
    metaTitle: 'Flagle Practice Tool — Country Flag Lookup',
    metaDescription:
      'Browse every country flag in one fast lookup tool built for Flagle players. Not affiliated with Flagle.',
    phase: 1,
  },
  {
    id: 'globle',
    name: 'Globle',
    hubSlug: 'globle-practice',
    tagline: 'Location, borders & continent lookup',
    intro:
      'Globle colors the globe by how close each guess is to the mystery country. This tool helps you study where a country actually sits, which countries border it, and which continent it belongs to.',
    metaTitle: 'Globle Practice & Help — Country Location Lookup',
    metaDescription:
      'Practice tool and help for Globle players: look up any country’s location, borders, and continent on an interactive map. Independent, unofficial fan tool.',
    phase: 1,
  },
  {
    id: 'seterra',
    name: 'Seterra',
    hubSlug: 'seterra-practice',
    tagline: 'Flags, capitals, rivers, mountains & provinces lookup',
    intro:
      'Seterra map quizzes cover flags, capitals, rivers, mountains, major cities, and states or provinces. This tool pulls all of those facts into one country-by-country lookup for study.',
    metaTitle: 'Seterra Practice Tool — Map Quiz Lookup',
    metaDescription:
      'Study flags, capitals, rivers, mountains, major cities, and provinces by country — a fast reference built for Seterra map quizzes.',
    phase: 2,
  },
  {
    id: 'travle',
    name: 'Travle',
    hubSlug: 'travle-practice',
    tagline: 'Bordering countries lookup',
    intro:
      'Travle asks you to connect one country to another using a chain of shared borders. This tool’s border list is built for exactly that — click any country to jump straight to its neighbors.',
    metaTitle: 'Travle Practice Tool — Bordering Countries Lookup',
    metaDescription:
      'Find any country’s bordering countries instantly and click through the chain. A fast, independent lookup tool for Travle players.',
    phase: 1,
  },
  {
    id: 'capitalle',
    name: 'Capitalle',
    hubSlug: 'capitalle-practice',
    tagline: 'Capital city & population lookup',
    intro:
      'Capitalle-style games quiz you on capital cities. Use this tool to look up any country’s capital alongside its population size and region for quick studying.',
    metaTitle: 'Capitalle Practice Tool — World Capitals Lookup',
    metaDescription:
      'Look up world capitals, population brackets, and regions in one fast reference built for Capitalle and capital-city guessing games.',
    phase: 1,
  },
  {
    id: 'countryle',
    name: 'Countryle',
    hubSlug: 'countryle-practice',
    tagline: 'Population, climate, area & language lookup',
    intro:
      'Countryle-style games narrow down a mystery country using stats like population, land area, climate, and language. Use this tool to study those exact facts, country by country.',
    metaTitle: 'Countryle Practice Tool — Country Stats Lookup',
    metaDescription:
      'Look up population, climate, land area, and language for any country — a fast reference for Countryle-style guessing games.',
    phase: 2,
  },
  {
    id: 'citydle',
    name: 'Citydle',
    hubSlug: 'citydle-practice',
    tagline: 'Major cities lookup',
    intro:
      'Citydle-style games test whether you know which country a city belongs to. Browse major cities by country here to build that mental map.',
    metaTitle: 'Citydle Practice Tool — Major Cities by Country',
    metaDescription:
      'Look up major cities for any country and see how they pair with capitals and continents — practice for Citydle-style city-guessing games.',
    phase: 2,
  },
  {
    id: 'brandle',
    name: 'Brandle',
    hubSlug: 'brandle-practice',
    tagline: 'Notable brands lookup',
    intro:
      'Brandle-style games quiz you on which country a company or brand comes from. This tool lists notable brands by country of origin, where curated content is available.',
    metaTitle: 'Brandle Practice Tool — Brands by Country',
    metaDescription:
      'Look up notable brands and companies by country of origin — a practice reference for Brandle-style brand-guessing games.',
    phase: 2,
  },
  {
    id: 'globo',
    name: 'Globo',
    hubSlug: 'globo-practice',
    tagline: 'Flags, capitals, landmarks, brands, food & states lookup',
    intro:
      'Globo-style games mix flags, capitals, landmarks, brands, food, and culture into one quiz. This tool gathers all of those facts per country in a single lookup card.',
    metaTitle: 'Globo Practice Tool — Culture & Geography Lookup',
    metaDescription:
      'Look up flags, capitals, landmarks, brands, food, and states by country — a fast reference for Globo-style culture and geography games.',
    phase: 2,
  },
];

export const GAME_BY_ID: Record<GameId, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
) as Record<GameId, GameDef>;

export const GAME_BY_HUB_SLUG: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.hubSlug, g])
);

export function isGameId(value: string): value is GameId {
  return GAMES.some((g) => g.id === value);
}

/**
 * Which games each card field belongs to. Add a game elsewhere in the app by
 * adding it to GAMES above and tagging the fields it quizzes here — the card
 * and filter UI derive everything from these tags, no per-game UI branching.
 */
export const FIELD_GAMES: Record<FieldKey, GameId[]> = {
  flag: ['flagle', 'seterra', 'globo'],
  capital: ['worldle', 'capitalle', 'seterra', 'globo'],
  region: ['globle', 'capitalle', 'citydle'],
  population: ['capitalle', 'countryle'],
  borders: ['globle', 'travle'],
  outline: ['worldle'],
  languages: ['worldle', 'countryle'],
  currencies: [],
  area: ['countryle'],
  climate: ['countryle'],
  rivers: ['seterra'],
  mountains: ['seterra'],
  majorCities: ['seterra', 'citydle'],
  provinces: ['seterra', 'globo'],
  landmarks: ['globo'],
  brands: ['brandle', 'globo'],
  food: ['globo'],
};

export function fieldVisibleFor(field: FieldKey, gameId: GameId | 'all'): boolean {
  if (gameId === 'all') return true;
  return FIELD_GAMES[field].includes(gameId);
}
