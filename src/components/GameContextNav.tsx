'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GAME_BY_ID, GAME_BY_HUB_SLUG, GAMES, isGameId, type GameId } from '@/lib/games';

/**
 * The single control for "which game am I practicing for." Replaces what
 * used to be two separate, redundant rows (a top nav linking to hub pages,
 * and a filter-chip row re-filtering the current country's card) with one:
 * every pill is a real link, so search engines can still find and rank each
 * game's hub page, and picking one carries your current country forward if
 * you're already looking at one.
 *
 * "All" is pinned outside the scrollable area so it's never scrolled out of
 * reach. The rest are ordered by a best guess at popularity (see games.ts)
 * and only actually scroll once they don't fit — which in practice means
 * "only on a phone," since a desktop-width header has room for all of them.
 */
export default function GameContextNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const forParam = searchParams.get('for');
  const hubSlug = pathname.replace(/^\//, '');
  const hubGame = GAME_BY_HUB_SLUG[hubSlug];
  const activeGame: GameId | 'all' = forParam && isGameId(forParam) ? forParam : hubGame ? hubGame.id : 'all';

  const countryMatch = pathname.match(/^\/country\/([^/]+)/);
  const currentSlug = countryMatch?.[1] ?? null;

  function hrefFor(id: GameId | 'all'): string {
    if (currentSlug) {
      return `/country/${currentSlug}${id !== 'all' ? `?for=${id}` : ''}`;
    }
    return id === 'all' ? '/' : `/${GAME_BY_ID[id].hubSlug}`;
  }

  return (
    <div className="flex items-center gap-2">
      <NavPill href={hrefFor('all')} active={activeGame === 'all'}>
        All
      </NavPill>
      <div className="relative min-w-0 flex-1">
        <div className="flex gap-2 overflow-x-auto scroll-smooth pr-6 [scrollbar-width:thin]">
          {GAMES.map((g) => (
            <NavPill key={g.id} href={hrefFor(g.id)} active={activeGame === g.id}>
              {g.name}
            </NavPill>
          ))}
        </div>
        {/* Peek/fade hint that there's more to scroll to — only matters (and
            only shows, since it's just extra content past the edge) once the
            row doesn't fit, i.e. mainly on phone-width screens. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950"
        />
      </div>
    </div>
  );
}

function NavPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </Link>
  );
}
