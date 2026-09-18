import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CountryExplorer from '@/components/CountryExplorer';
import { COUNTRIES, getCountryBySlug } from '@/lib/countries';
import { isGameId } from '@/lib/games';
import { countryDescription, countryTitle } from '@/lib/seo';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return COUNTRIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ for?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { for: forParam } = await searchParams;
  const country = getCountryBySlug(slug);
  if (!country) return {};
  const game = forParam && isGameId(forParam) ? forParam : 'all';
  const title = countryTitle(country, game);
  const description = countryDescription(country, game);
  return {
    title,
    description,
    alternates: { canonical: `/country/${country.slug}` },
    openGraph: { title, description },
  };
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ for?: string }>;
}) {
  const { slug } = await params;
  const { for: forParam } = await searchParams;
  const country = getCountryBySlug(slug);
  if (!country) notFound();
  const game = forParam && isGameId(forParam) ? forParam : 'all';

  return (
    <div className="min-h-[600px] flex-1">
      <CountryExplorer country={country} game={game} />
    </div>
  );
}
