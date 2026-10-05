import type { Country } from './types';

export function countryTitle(country: Country): string {
  return `${country.name} — Country Facts & Map Lookup`;
}

export function countryDescription(country: Country): string {
  const bits: string[] = [];
  if (country.capital) bits.push(`capital ${country.capital}`);
  bits.push(`${country.region}`);
  if (country.population) bits.push(`population ${Math.round(country.population / 1000) / 1000}M`.replace('.0M', 'M'));
  const facts = bits.join(', ');
  return `${country.name}: ${facts}, bordering countries, and country shape — a fast, no-login lookup card for geography guessing games.`;
}
