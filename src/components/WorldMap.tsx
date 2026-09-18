'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { countryFeatures, getCountryCentroid } from '@/lib/worldGeo';
import type { Country } from '@/lib/types';

// ComposableMap's internal viewBox, fixed regardless of how large the SVG is
// actually rendered on screen (see react-simple-maps' ComposableMap defaults).
const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 600;

interface WorldMapProps {
  countriesByCcn3: Map<string, Country>;
  selected: Country | null;
  onSelect: (country: Country) => void;
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
}

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
 */
function CountryLabel({ ccn3, name, zoom, pxPerUnit, emphasize }: CountryLabelProps) {
  const centroid = getCountryCentroid(ccn3);
  if (!centroid) return null;

  const targetScreenPx = emphasize ? 12.5 : 11;
  const fontSize = targetScreenPx / pxPerUnit;
  const paddingX = fontSize * 0.4;
  const paddingY = fontSize * 0.24;
  const width = name.length * fontSize * 0.56 + paddingX * 2;
  const height = fontSize + paddingY * 2;

  return (
    <Marker coordinates={centroid}>
      <g transform={`scale(${1 / zoom})`} style={{ pointerEvents: 'none' }}>
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill="#ffffff"
          fillOpacity={0.94}
          stroke={emphasize ? '#059669' : '#64748b'}
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
      </g>
    </Marker>
  );
}

export default function WorldMap({ countriesByCcn3, selected, onSelect }: WorldMapProps) {
  const [center, setCenter] = useState<[number, number]>([10, 20]);
  const [zoom, setZoom] = useState(1.1);
  const [focusedCcn3, setFocusedCcn3] = useState<string | null>(null);
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

  const borderCcn3s = useMemo(
    () => new Set(selected?.borders.map((b) => b.ccn3) ?? []),
    [selected]
  );

  return (
    <div ref={containerRef} className="h-full w-full bg-slate-100 dark:bg-slate-900">
      <ComposableMap
        projection="geoEqualEarth"
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={center} zoom={zoom} minZoom={1} maxZoom={16} onMoveEnd={(pos) => {
          if (pos.coordinates) setCenter(pos.coordinates);
          if (pos.zoom) setZoom(pos.zoom);
        }}>
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
                        ? 'cursor-pointer stroke-white outline-none transition-colors duration-150 dark:stroke-slate-950'
                        : 'stroke-white outline-none dark:stroke-slate-950'
                    }
                    fill={
                      isSelected
                        ? '#059669'
                        : isBorder
                          ? '#a7f3d0'
                          : country
                            ? '#94a3b8'
                            : '#e2e8f0'
                    }
                    strokeWidth={0.5}
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
            />
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
