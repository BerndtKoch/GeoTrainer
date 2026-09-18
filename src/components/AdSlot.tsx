/**
 * Placeholder for ad inventory. Deliberately kept out of the map/search/card
 * flow (never overlaying or pushing it around) so it can't interrupt a
 * mid-game lookup. Wire an actual ad network's script/tag in here later.
 */
export default function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return (
    <div
      className="flex h-[90px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700"
      aria-hidden
    >
      {label}
    </div>
  );
}
