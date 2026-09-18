import { GAME_BY_ID, type GameId } from './games';
import type { Country } from './types';

export function countryTitle(country: Country, game: GameId | 'all'): string {
  if (game === 'all') return `${country.name} — Country Facts & Map Lookup`;
  const g = GAME_BY_ID[game];
  return `${country.name} for ${g.name} — ${g.tagline}`;
}

export function countryDescription(country: Country, game: GameId | 'all'): string {
  const bits: string[] = [];
  if (country.capital) bits.push(`capital ${country.capital}`);
  bits.push(`${country.region}`);
  if (country.population) bits.push(`population ${Math.round(country.population / 1000) / 1000}M`.replace('.0M', 'M'));
  const facts = bits.join(', ');
  if (game === 'all') {
    return `${country.name}: ${facts}, bordering countries, and country shape — a fast, no-login lookup card for geography guessing games.`;
  }
  const g = GAME_BY_ID[game];
  return `Look up ${country.name} (${facts}) for ${g.name}. A free, independent practice reference — not affiliated with ${g.name}.`;
}
