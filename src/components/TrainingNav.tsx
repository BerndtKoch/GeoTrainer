'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'All' },
  { href: '/capitals', label: 'Capitals' },
  { href: '/flags', label: 'Flags' },
  { href: '/shapes', label: 'Shapes/Maps' },
];

export default function TrainingNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:thin]">
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' || pathname.startsWith('/country/') : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              active
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-600 hover:-translate-y-0.5 hover:bg-slate-200 hover:shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
