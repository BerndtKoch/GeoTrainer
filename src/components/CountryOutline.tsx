import { geoEqualEarth, geoPath } from 'd3-geo';
import { getCountryPrimaryShape } from '@/lib/worldGeo';

interface CountryOutlineProps {
  ccn3: string;
  className?: string;
}

const SIZE = 140;

export default function CountryOutline({ ccn3, className }: CountryOutlineProps) {
  const primary = getCountryPrimaryShape(ccn3);
  if (!primary) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-slate-400 ${className ?? ''}`}
        style={{ width: SIZE, height: SIZE }}
      >
        Shape unavailable
      </div>
    );
  }
  const { feature, centroid } = primary;

  // Rotate so the shape's own longitude sits at the center before fitting.
  // Without this, a country whose mainland itself crosses the antimeridian
  // (Russia's Chukotka peninsula crosses 180°) gets measured as if it spans
  // nearly the whole globe instead of its own normal width — see
  // getCountryPrimaryShape's doc comment for the full story.
  const projection = geoEqualEarth().rotate([-centroid[0], 0]).fitSize([SIZE - 8, SIZE - 8], feature);
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
