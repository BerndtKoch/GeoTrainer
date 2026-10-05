'use client';

interface SubTabsProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function SubTabs<T extends string>({ options, value, onChange }: SubTabsProps<T>) {
  return (
    <div className="flex gap-1.5 border-b border-slate-200 pb-3 dark:border-slate-700">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            value === opt.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
