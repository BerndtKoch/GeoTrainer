import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CountryExplorer from '@/components/CountryExplorer';
import { COUNTRIES, getCountryBySlug } from '@/lib/countries';
import { countryDescription, countryTitle } from '@/lib/seo';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return COUNTRIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return {};
  const title = countryTitle(country);
  const description = countryDescription(country);
  return {
    title,
    description,
    alternates: { canonical: `/country/${country.slug}` },
    openGraph: { title, description },
  };
}

export default async function CountryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  return (
    <div className="min-h-[600px] flex-1">
      <CountryExplorer country={country} />
    </div>
  );
}
