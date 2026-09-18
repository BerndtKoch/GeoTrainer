# GeoTrainer

A fast, no-login country lookup tool for players of Worldle, Globle, Flagle,
Countryle, Capitalle, Travle, Citydle, Brandle, Seterra, and Globo. Click a
country on the map (or search by name) and get an instant info card, filtered
to just the facts your game quizzes you on.

GeoTrainer is an independent reference tool — it is not affiliated with,
endorsed by, or sponsored by any of the games it links out to or mentions.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS** — server-rendered
  pages for real, indexable, per-country/per-game URLs.
- **[world-countries](https://www.npmjs.com/package/world-countries)** and
  **[country-json](https://www.npmjs.com/package/country-json)** — open
  datasets for the objective fields (flag, capital, population, area,
  borders, languages, currencies, climate).
- **[world-atlas](https://www.npmjs.com/package/world-atlas)** +
  **[react-simple-maps](https://www.npmjs.com/package/react-simple-maps)** —
  the clickable world map and the per-country outline/silhouette.
- **[flag-icons](https://www.npmjs.com/package/flag-icons)** — flag SVGs.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run build` regenerates `src/data/countries.json` from the open datasets
(via `npm run build:data`) before building the Next.js app, so the app never
fetches country data at runtime.

## How the game-filter system works

Every field on the country card (flag, capital, borders, rivers, brands...)
is tagged in `src/lib/games.ts` (`FIELD_GAMES`) with the games that quiz on
it. The card and the filter picker just read those tags — nothing in the UI
is hardcoded per game. To add a new game:

1. Add a `GameDef` to `GAMES` in `src/lib/games.ts` (name, hub URL slug,
   meta title/description, intro copy).
2. Add its id to the relevant fields in `FIELD_GAMES`.
3. Add a hub page folder, e.g. `src/app/newgame-practice/page.tsx`:
   ```tsx
   import { hubMetadata, HubPage } from '@/lib/hubPage';
   export const metadata = hubMetadata('newgame');
   export default function Page() {
     return <HubPage id="newgame" />;
   }
   ```

## Data pipeline

`scripts/build-data.mjs` builds `src/data/countries.json` from:

- `world-countries` — sovereign-country list, capitals, regions, borders,
  area, languages, currencies, lat/lng.
- `country-json` — population and yearly-average-temperature (used to derive
  a rough climate label) and national dish.
- `scripts/curated-content.mjs` — hand-curated rivers, mountains, major
  cities, states/provinces, landmarks, and brands, keyed by ISO alpha-3 code.

### Phase 2 content

Per the product brief, rivers/mountains/major cities/provinces/landmarks/
brands are **progressively curated**, not blocked on launch — the build
intentionally ships with these empty (rendered as "Not added yet" on the
card) for any country not yet in `scripts/curated-content.mjs`. To fill in
more countries, add an entry keyed by `cca3` there and re-run
`npm run build:data`. Only add facts you're confident are correct — this is
a reference tool people use mid-quiz, so a wrong fact is worse than a
missing one.

## Project layout

- `src/app/` — routes: `/`, `/country/[slug]`, `/[game]-practice` hub pages,
  `sitemap.ts`, `robots.ts`.
- `src/components/` — `WorldMap`, `SearchBox`, `GameFilterPicker`,
  `CountryCard`, `CountryOutline`, `CountryExplorer` (composes the above).
- `src/lib/` — `types.ts`, `games.ts` (game + field-tag config),
  `countries.ts` (data access/search), `seo.ts`, `worldGeo.ts` (topojson →
  GeoJSON), `hubPage.tsx`.
- `scripts/` — the offline data build (`build-data.mjs`,
  `curated-content.mjs`).
