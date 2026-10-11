import { geoEqualEarth, geoPath } from 'd3-geo';
import type { Feature, Polygon, Position } from 'geojson';
import { getCountryPrimaryShape } from '@/lib/worldGeo';

interface CountryOutlineProps {
  ccn3: string;
  className?: string;
}

const SIZE = 140;

// Below this rendered size (viewBox units, out of the fixed 140 SIZE above),
// a landmass is given a minimum-size dot instead of its true path. Without
// this, a nation made of a few atolls scattered across thousands of km of
// ocean (Kiribati, Marshall Islands, Micronesia) renders as an essentially
// invisible 2-3px speck even at its largest island — true-to-scale with
// almost no land area just can't be made visible by fitting the bounding
// box alone. Calibrated against the smallest places this component is
// actually shown (the study list and history grid's small icons, ~32-40px
// on screen) so even those keep a legible dot rather than a blank icon.
//
// Only applies when the LARGEST part is itself below this size — i.e. the
// whole country has no single dominant landmass to anchor recognizability
// (Kiribati's atolls are all comparably tiny). A country with one big,
// already-recognizable main landmass and some genuinely small satellite
// islands (Greece's mainland + Aegean islands, the UK, Portugal) is left
// exactly as before: those small islands render at their true tiny size,
// which is correct in context — inflating them to the same fixed dot size
// used for Kiribati made them look disproportionately large next to a
// mainland that was already fine.
const MIN_PART_DIAMETER = 14;

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

  const parts: Position[][][] =
    feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;

  const partsWithSize = parts.map((coordinates) => {
    const polygon: Feature<Polygon> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } };
    const bounds = path.bounds(polygon);
    const size = Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
    return { polygon, bounds, size };
  });

  const largestPartSize = Math.max(0, ...partsWithSize.map((p) => p.size));
  const noDominantLandmass = largestPartSize < MIN_PART_DIAMETER;

  const renderedParts = partsWithSize
    .map(({ polygon, bounds, size }) => {
      if (noDominantLandmass && size < MIN_PART_DIAMETER) {
        return {
          type: 'dot' as const,
          cx: (bounds[0][0] + bounds[1][0]) / 2,
          cy: (bounds[0][1] + bounds[1][1]) / 2,
        };
      }
      return { type: 'path' as const, d: path(polygon) ?? undefined };
    })
    .filter((part) => part.type === 'dot' || !!part.d);

  if (renderedParts.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label="Country outline / shape"
    >
      <g transform="translate(4, 4)">
        {renderedParts.map((part, i) =>
          part.type === 'dot' ? (
            <circle
              key={i}
              cx={part.cx}
              cy={part.cy}
              r={MIN_PART_DIAMETER / 2}
              className="fill-emerald-600 dark:fill-emerald-500"
            />
          ) : (
            <path key={i} d={part.d} className="fill-emerald-600 dark:fill-emerald-500" />
          )
        )}
      </g>
    </svg>
  );
}
