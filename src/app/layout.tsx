import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import AdSlot from '@/components/AdSlot';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://geotrainer.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GeoTrainer — Instant Country Lookup for Geography Games',
    template: '%s | GeoTrainer',
  },
  description:
    'GeoTrainer is a fast, no-login country lookup tool for players of Worldle, Globle, Flagle, Countryle, Capitalle, Travle, and other geography guessing games.',
  openGraph: {
    type: 'website',
    siteName: 'GeoTrainer',
    title: 'GeoTrainer — Instant Country Lookup for Geography Games',
    description:
      'Click a country, get the facts. A fast practice companion for Worldle, Globle, Flagle, Travle, Capitalle and more.',
  },
  twitter: {
    card: 'summary',
    title: 'GeoTrainer — Instant Country Lookup for Geography Games',
    description:
      'Click a country, get the facts. A fast practice companion for popular geography guessing games.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="text-xl">🌍</span>
              <span>GeoTrainer</span>
            </Link>
            <nav className="hidden gap-4 text-sm text-slate-500 sm:flex dark:text-slate-400">
              <Link href="/worldle-practice" className="hover:text-emerald-600">
                Worldle
              </Link>
              <Link href="/globle-practice" className="hover:text-emerald-600">
                Globle
              </Link>
              <Link href="/flagle-practice" className="hover:text-emerald-600">
                Flagle
              </Link>
              <Link href="/travle-practice" className="hover:text-emerald-600">
                Travle
              </Link>
              <Link href="/capitalle-practice" className="hover:text-emerald-600">
                Capitalle
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4">{children}</main>
        <div className="mx-auto w-full max-w-6xl px-4">
          <AdSlot />
        </div>
        <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
          <p>
            GeoTrainer is an independent reference tool and is not affiliated with, endorsed by, or
            sponsored by Worldle, Globle, Flagle, Countryle, Capitalle, Travle, Citydle, Brandle,
            Seterra, Globo, or GeoGuessr.
          </p>
        </footer>
      </body>
    </html>
  );
}
