import countriesData from '@/data/countries.json';
import type { Country } from './types';

export const COUNTRIES = countriesData as Country[];

const BY_SLUG = new Map(COUNTRIES.map((c) => [c.slug, c]));
const BY_CCN3 = new Map(COUNTRIES.map((c) => [c.ccn3, c]));

export function getCountryBySlug(slug: string): Country | undefined {
  return BY_SLUG.get(slug);
}

export function getCountryByCcn3(ccn3: string): Country | undefined {
  return BY_CCN3.get(ccn3);
}

export function getAllSlugs(): string[] {
  return COUNTRIES.map((c) => c.slug);
}

export function searchCountries(query: string, limit = 8): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: Country[] = [];
  const contains: Country[] = [];
  for (const c of COUNTRIES) {
    const name = c.name.toLowerCase();
    const capital = c.capital?.toLowerCase() ?? '';
    if (name.startsWith(q)) {
      starts.push(c);
    } else if (name.includes(q) || capital.includes(q)) {
      contains.push(c);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

export function populationBracketLabel(bracket: Country['populationBracket']): string {
  switch (bracket) {
    case 'small':
      return 'Small (under 5M)';
    case 'medium':
      return 'Medium (5M–50M)';
    case 'large':
      return 'Large (50M+)';
    default:
      return 'Unknown';
  }
}

export function formatPopulation(pop: number | null): string {
  if (pop == null) return 'Unknown';
  return new Intl.NumberFormat('en-US').format(pop);
}

export function formatArea(area: number | null): string {
  if (area == null) return 'Unknown';
  return `${new Intl.NumberFormat('en-US').format(Math.round(area))} km²`;
}
