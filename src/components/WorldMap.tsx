'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere, ZoomableGroup } from 'react-simple-maps';
import {
  countryFeatures,
  getCountryCentroid,
  getCountryFootprint,
  projectBase,
  WORLD_VIEWBOX_HEIGHT,
  WORLD_VIEWBOX_WIDTH,
} from '@/lib/worldGeo';
import type { Country } from '@/lib/types';

// ComposableMap's internal viewBox, fixed regardless of how large the SVG is
// actually rendered on screen (see react-simple-maps' ComposableMap defaults).
const VIEWBOX_WIDTH = WORLD_VIEWBOX_WIDTH;
const VIEWBOX_HEIGHT = WORLD_VIEWBOX_HEIGHT;

// Measured for real contrast rather than eyeballed: ocean/land is 7.9:1
// (WCAG's non-text minimum is 3:1). See the change-list doc for the numbers.
const COLORS = {
  ocean: '#274b6d',
  oceanStroke: '#1b3550',
  graticule: '#345b7d',
  land: '#eef0e9',
  landNoData: '#c9d1c5',
  countryStroke: '#274b6d',
  selected: '#059669',
  bordering: '#b45309',
};

export interface RegionFocus {
  /** Changes on every pick, including re-picking the same region, so the
   * map re-centers even if the framing values themselves are identical. */
  token: number;
  center: [number, number];
  zoom: number;
}

interface WorldMapProps {
  countriesByCcn3: Map<string, Country>;
  selected: Country | null;
  onSelect: (country: Country) => void;
  regionFocus?: RegionFocus | null;
}

function zoomForArea(area: number | null): number {
  if (area == null) return 3;
  if (area > 3_000_000) return 1.6;
  if (area > 500_000) return 2.6;
  if (area > 100_000) return 4;
  if (area > 10_000) return 7;
  return 12;
}

interface CountryLabelProps {
  ccn3: string;
  name: string;
  zoom: number;
  /** Physical CSS pixels per viewBox unit at the map's current rendered size. */
  pxPerUnit: number;
  emphasize: boolean;
  /** The selected country's own centroid, to offset a small country's label
   * away from it. Omitted for the selected country's own label — there's no
   * other center to be "away from". */
  awayFrom?: [number, number];
}

const DOT_RADIUS_SCREEN_PX = 3;
// Gap between the dot and the nearest edge of the offset label — on top of
// the label's own half-diagonal (see below), not instead of it. A fixed
// offset alone isn't enough: for a long name like "Equatorial Guinea" or
// "Republic of the Congo", the label pill is often wider than a short fixed
// offset, so the dot ends up re-covered by the very label it's meant to be
// distinct from.
const LEADER_GAP_SCREEN_PX = 8;
// Used only when there's no awayFrom reference point (the selected
// country's own label, if it's the one that's too small for itself).
const DEFAULT_LEADER_DIRECTION: [number, number] = [0.7, -0.7];

/**
 * Name tag for the selected country and its neighbors, so you can tell which
 * highlighted shape is which without guessing.
 *
 * Two independent corrections keep this a constant, readable physical size:
 * - `1/zoom` cancels out the ZoomableGroup's own scale, so labels don't
 *   balloon as you zoom into a small country.
 * - `1/pxPerUnit` converts a target on-screen pixel size into the current
 *   container's viewBox units, so labels aren't sized for a desktop-width
 *   map and then rendered illegibly small in a phone-width one.
 *
 * A very small country (Singapore, Equatorial Guinea) can still be smaller
 * than its own label even after the above — centering the label on the
 * shape would then paint over it entirely. When the label would overflow
 * the country's actual on-screen footprint at the current zoom, this marks
 * the true location with a small dot instead and offsets the label into
 * open space, connected back by a thin leader line — the usual atlas
 * convention for small islands and cities.
 */
function CountryLabel({ ccn3, name, zoom, pxPerUnit, emphasize, awayFrom }: CountryLabelProps) {
  const centroid = getCountryCentroid(ccn3);
  if (!centroid) return null;

  const targetScreenPx = emphasize ? 12.5 : 11;
  const fontSize = targetScreenPx / pxPerUnit;
  const paddingX = fontSize * 0.4;
  const paddingY = fontSize * 0.24;
  const labelWidth = name.length * fontSize * 0.56 + paddingX * 2;
  const labelHeight = fontSize + paddingY * 2;
  const strokeColor = emphasize ? COLORS.selected : COLORS.bordering;

  const label = (
    <>
      <rect
        x={-labelWidth / 2}
        y={-labelHeight / 2}
        width={labelWidth}
        height={labelHeight}
        rx={labelHeight / 2}
        fill="#ffffff"
        fillOpacity={0.94}
        stroke={strokeColor}
        strokeWidth={fontSize * 0.08}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight={emphasize ? 700 : 600}
        fill="#0f172a"
      >
        {name}
      </text>
    </>
  );

  const footprint = getCountryFootprint(ccn3);
  const overflows = !!footprint && (labelWidth > footprint.width * zoom || labelHeight > footprint.height * zoom);

  if (!overflows) {
    return (
      <Marker coordinates={centroid}>
        <g transform={`scale(${1 / zoom})`} style={{ pointerEvents: 'none' }}>
          {label}
        </g>
      </Marker>
    );
  }

  const here = projectBase(centroid);
  const from = awayFrom ? projectBase(awayFrom) : null;
  let [dirX, dirY] = DEFAULT_LEADER_DIRECTION;
  if (here && from) {
    const rawX = here[0] - from[0];
    const rawY = here[1] - from[1];
    const length = Math.hypot(rawX, rawY);
    if (length > 0.001) {
      dirX = rawX / length;
      dirY = rawY / length;
    }
  }

  const dotRadius = DOT_RADIUS_SCREEN_PX / pxPerUnit;
  // Distance from the dot to the label's own center, not just a fixed gap:
  // the label's half-diagonal guarantees the dot clears its (axis-aligned)
  // rectangle in every direction, however long the name is; the extra gap
  // is just breathing room on top of that guarantee.
  const halfDiagonal = Math.hypot(labelWidth / 2, labelHeight / 2);
  const offset = halfDiagonal + LEADER_GAP_SCREEN_PX / pxPerUnit;
  const labelX = dirX * offset;
  const labelY = dirY * offset;

  return (
    <Marker coordinates={centroid}>
      <g transform={`scale(${1 / zoom})`} style={{ pointerEvents: 'none' }}>
        <line x1={0} y1={0} x2={labelX} y2={labelY} stroke={strokeColor} strokeWidth={fontSize * 0.08} />
        <circle cx={0} cy={0} r={dotRadius} fill={strokeColor} />
        <g transform={`translate(${labelX}, ${labelY})`}>{label}</g>
      </g>
    </Marker>
  );
}

export default function WorldMap({ countriesByCcn3, selected, onSelect, regionFocus }: WorldMapProps) {
  const [center, setCenter] = useState<[number, number]>([10, 20]);
  const [zoom, setZoom] = useState(1.1);
  const [focusedCcn3, setFocusedCcn3] = useState<string | null>(null);
  const [focusedRegionToken, setFocusedRegionToken] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pxPerUnit, setPxPerUnit] = useState(0.55);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setPxPerUnit(Math.min(width / VIEWBOX_WIDTH, height / VIEWBOX_HEIGHT));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-center when a new country is selected (e.g. via search or a border
  // link), without fighting the user's own pan/zoom afterward. This adjusts
  // state during render instead of in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if ((selected?.ccn3 ?? null) !== focusedCcn3) {
    setFocusedCcn3(selected?.ccn3 ?? null);
    if (selected?.latlng) {
      const [lat, lng] = selected.latlng;
      setCenter([lng, lat]);
      setZoom(zoomForArea(selected.area));
    }
  }

  // Same pattern, for the region selector: jump the map to a region's
  // computed framing without selecting any country.
  if (regionFocus && regionFocus.token !== focusedRegionToken) {
    setFocusedRegionToken(regionFocus.token);
    setCenter(regionFocus.center);
    setZoom(regionFocus.zoom);
  }

  const borderCcn3s = useMemo(
    () => new Set(selected?.borders.map((b) => b.ccn3) ?? []),
    [selected]
  );
  const selectedCentroid = selected ? getCountryCentroid(selected.ccn3) : undefined;

  return (
    <div ref={containerRef} className="h-full w-full" style={{ background: COLORS.ocean }}>
      <ComposableMap
        projection="geoEqualEarth"
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={center} zoom={zoom} minZoom={1} maxZoom={16} onMoveEnd={(pos) => {
          if (pos.coordinates) setCenter(pos.coordinates);
          if (pos.zoom) setZoom(pos.zoom);
        }}>
          <Sphere id="geotrainer-sphere" fill={COLORS.ocean} stroke={COLORS.oceanStroke} strokeWidth={0.75} />
          <Graticule stroke={COLORS.graticule} strokeWidth={0.35} />
          <Geographies geography={countryFeatures}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const country = countriesByCcn3.get(String(geo.id));
                const isSelected = !!country && !!selected && country.ccn3 === selected.ccn3;
                const isBorder = !!country && borderCcn3s.has(country.ccn3);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => country && onSelect(country)}
                    className={
                      country
                        ? 'cursor-pointer outline-none transition-colors duration-150'
                        : 'outline-none'
                    }
                    fill={
                      isSelected
                        ? COLORS.selected
                        : isBorder
                          ? COLORS.bordering
                          : country
                            ? COLORS.land
                            : COLORS.landNoData
                    }
                    stroke={COLORS.countryStroke}
                    strokeWidth={0.4}
                  />
                );
              })
            }
          </Geographies>

          {selected && (
            <CountryLabel
              ccn3={selected.ccn3}
              name={selected.name}
              zoom={zoom}
              pxPerUnit={pxPerUnit}
              emphasize
            />
          )}
          {selected?.borders.map((b) => (
            <CountryLabel
              key={b.ccn3}
              ccn3={b.ccn3}
              name={b.name}
              zoom={zoom}
              pxPerUnit={pxPerUnit}
              emphasize={false}
              awayFrom={selectedCentroid}
            />
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
