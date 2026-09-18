import type { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/countries';
import { GAMES } from '@/lib/games';

const SITE_URL = 'https://geotrainer.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...GAMES.map((g) => ({
      url: `${SITE_URL}/${g.hubSlug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  const countryEntries: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/country/${c.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...countryEntries];
}
