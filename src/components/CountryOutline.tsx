import { geoEqualEarth, geoPath } from 'd3-geo';
import { getCountryFeature } from '@/lib/worldGeo';

interface CountryOutlineProps {
  ccn3: string;
  className?: string;
}

const SIZE = 140;

export default function CountryOutline({ ccn3, className }: CountryOutlineProps) {
  const feature = getCountryFeature(ccn3);
  if (!feature) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-slate-400 ${className ?? ''}`}
        style={{ width: SIZE, height: SIZE }}
      >
        Shape unavailable
      </div>
    );
  }

  const projection = geoEqualEarth().fitSize([SIZE - 8, SIZE - 8], feature);
  const path = geoPath(projection);
  const d = path(feature);
  if (!d) return null;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label="Country outline / shape"
    >
      <g transform="translate(4, 4)">
        <path d={d} className="fill-emerald-600 dark:fill-emerald-500" />
      </g>
    </svg>
  );
}
