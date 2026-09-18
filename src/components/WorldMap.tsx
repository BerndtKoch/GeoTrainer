'use client';

import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { countryFeatures } from '@/lib/worldGeo';
import type { Country } from '@/lib/types';

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

export default function WorldMap({ countriesByCcn3, selected, onSelect }: WorldMapProps) {
  const [center, setCenter] = useState<[number, number]>([10, 20]);
  const [zoom, setZoom] = useState(1.1);
  const [focusedCcn3, setFocusedCcn3] = useState<string | null>(null);

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
    <div className="h-full w-full bg-slate-100 dark:bg-slate-900">
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
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
