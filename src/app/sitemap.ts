import type { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/countries';

const SITE_URL = 'https://geotrainer.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/capitals`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/flags`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/shapes`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const countryEntries: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/country/${c.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...countryEntries];
}
