// Builds src/data/countries.json from open datasets (world-countries, country-json)
// plus scripts/curated-content.mjs. Run with `npm run build:data` whenever a
// source package or the curated content file changes — this is a build-time
// step, not something the running app does, so page loads stay instant.
import worldCountries from 'world-countries';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURATED } from './curated-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const popByName = new Map(
  JSON.parse(fs.readFileSync(path.join(root, 'node_modules/country-json/src/country-by-population.json'))).map((r) => [r.country, r.population])
);
const tempByName = new Map(
  JSON.parse(fs.readFileSync(path.join(root, 'node_modules/country-json/src/country-by-yearly-average-temperature.json'))).map((r) => [r.country, r.temperature])
);
const dishByName = new Map(
  JSON.parse(fs.readFileSync(path.join(root, 'node_modules/country-json/src/country-by-national-dish.json'))).map((r) => [r.country, r.dish])
);
// country-json spells a handful of names differently than world-countries
// (our canonical list). Map world-countries' common name -> country-json's
// name for those cases; everything else matches by name directly.
const nameAliases = {
  'Cape Verde': 'Cabo Verde',
  'DR Congo': 'The Democratic Republic of Congo',
  'Republic of the Congo': 'Congo',
  Czechia: 'Czech Republic',
  'Timor-Leste': 'East Timor',
  Fiji: 'Fiji Islands',
  'Vatican City': 'Holy See (Vatican City State)',
  Micronesia: 'Micronesia, Federated States of',
  'São Tomé and Príncipe': 'Sao Tome and Principe',
  Türkiye: 'Turkey',
};
function countryJsonName(worldCountriesCommonName) {
  return nameAliases[worldCountriesCommonName] ?? worldCountriesCommonName;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function populationBracket(pop) {
  if (pop == null) return null;
  if (pop < 5_000_000) return 'small';
  if (pop < 50_000_000) return 'medium';
  return 'large';
}

function climateFromTemp(temp) {
  if (temp == null) return null;
  if (temp >= 24) return 'Tropical / hot';
  if (temp >= 15) return 'Warm / arid';
  if (temp >= 5) return 'Temperate';
  return 'Cold / polar';
}

const independent = worldCountries.filter((c) => c.independent);

const cca3ToSlug = new Map(independent.map((c) => [c.cca3, slugify(c.name.common)]));
const cca3ToName = new Map(independent.map((c) => [c.cca3, c.name.common]));
const cca3ToCcn3 = new Map(independent.map((c) => [c.cca3, c.ccn3]));

const withArea = independent.filter((c) => typeof c.area === 'number' && c.area > 0);
const areaRankByCca3 = new Map(
  [...withArea].sort((a, b) => b.area - a.area).map((c, i) => [c.cca3, i + 1])
);

const countries = independent
  .map((c) => {
    const slug = slugify(c.name.common);
    const cjName = countryJsonName(c.name.common);
    const population = popByName.get(cjName) ?? null;
    const temp = tempByName.get(cjName) ?? null;
    const dish = dishByName.get(cjName) ?? null;
    const curated = CURATED[c.cca3] ?? {};

    const borders = (c.borders ?? [])
      .map((b3) => {
        const bSlug = cca3ToSlug.get(b3);
        const bName = cca3ToName.get(b3);
        const bCcn3 = cca3ToCcn3.get(b3);
        if (!bSlug || !bName || !bCcn3) return null;
        return { slug: bSlug, name: bName, cca3: b3, ccn3: bCcn3 };
      })
      .filter(Boolean);

    const languages = c.languages ? Object.values(c.languages) : [];
    const currencies = c.currencies
      ? Object.entries(c.currencies).map(([code, v]) => ({ code, name: v.name, symbol: v.symbol }))
      : [];

    const food = [];
    if (dish) {
      for (const item of dish.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)) {
        food.push(item);
      }
    }

    return {
      slug,
      name: c.name.common,
      officialName: c.name.official,
      cca2: c.cca2,
      cca3: c.cca3,
      ccn3: c.ccn3,
      capital: c.capital?.[0] ?? null,
      region: c.region,
      subregion: c.subregion ?? null,
      population,
      populationBracket: populationBracket(population),
      area: c.area ?? null,
      areaRank: areaRankByCca3.get(c.cca3) ?? null,
      landlocked: !!c.landlocked,
      languages,
      currencies,
      borders,
      latlng: c.latlng ?? null,
      climate: climateFromTemp(temp),
      food,
      rivers: curated.rivers ?? [],
      mountains: curated.mountains ?? [],
      majorCities: curated.majorCities ?? [],
      provinces: curated.provinces ?? [],
      landmarks: curated.landmarks ?? [],
      brands: curated.brands ?? [],
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const outDir = path.join(root, 'src/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'countries.json'), JSON.stringify(countries, null, 2));

console.log(`Wrote ${countries.length} countries to src/data/countries.json`);
const missingPop = countries.filter((c) => c.population == null).map((c) => c.name);
if (missingPop.length) {
  console.log(`No population data for ${missingPop.length} countries:`, missingPop.join(', '));
}
