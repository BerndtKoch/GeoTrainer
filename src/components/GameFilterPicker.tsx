'use client';

import { GAMES, type GameId } from '@/lib/games';

interface GameFilterPickerProps {
  value: GameId | 'all';
  onChange: (value: GameId | 'all') => void;
}

export default function GameFilterPicker({ value, onChange }: GameFilterPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter fields by game">
      <Chip label="All" active={value === 'all'} onClick={() => onChange('all')} />
      {GAMES.map((g) => (
        <Chip key={g.id} label={g.name} active={value === g.id} onClick={() => onChange(g.id)} />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
