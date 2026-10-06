'use client';

import { SCOPES, type Scope } from '@/lib/training';

interface RegionPickerProps {
  value: Scope;
  onChange: (value: Scope) => void;
}

export default function RegionPicker({ value, onChange }: RegionPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SCOPES.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            value === opt.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
