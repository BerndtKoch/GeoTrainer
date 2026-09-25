import { geoEqualEarth } from 'd3-geo';
import type { Position } from 'geojson';
import { COUNTRIES } from './countries';
import { getCountryPrimaryShape, WORLD_VIEWBOX_HEIGHT, WORLD_VIEWBOX_WIDTH } from './worldGeo';
import type { Country } from './types';

export type RegionId = 'europe' | 'africa' | 'asia' | 'oceania' | 'north-america' | 'south-america';

export interface Region {
  id: RegionId;
  name: string;
}

// The underlying country data lumps North and South America into one
// "Americas" region — split by subregion here instead, since that's how
// people actually think about continents.
export const REGIONS: Region[] = [
  { id: 'europe', name: 'Europe' },
  { id: 'africa', name: 'Africa' },
  { id: 'asia', name: 'Asia' },
  { id: 'oceania', name: 'Oceania' },
  { id: 'north-america', name: 'North America' },
  { id: 'south-america', name: 'South America' },
];

function countriesInRegion(id: RegionId): Country[] {
  if (id === 'north-america') {
    return COUNTRIES.filter((c) => c.region === 'Americas' && c.subregion !== 'South America');
  }
  if (id === 'south-america') {
    return COUNTRIES.filter((c) => c.region === 'Americas' && c.subregion === 'South America');
  }
  const name = REGIONS.find((r) => r.id === id)?.name;
  return COUNTRIES.filter((c) => c.region === name);
}

export function searchRegions(query: string): Region[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return REGIONS.filter((r) => r.name.toLowerCase().includes(q));
}

export interface RegionFraming {
  center: [number, number];
  zoom: number;
}

// Leaves a visible margin around the region instead of cropping it edge to
// edge against the map container.
const FIT_PADDING = 0.82;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

const FRAMING_CACHE = new Map<RegionId, RegionFraming | null>();

function ringsOf(geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Position[][] | Position[][][] }): Position[][] {
  return geometry.type === 'Polygon'
    ? (geometry.coordinates as Position[][])
    : (geometry.coordinates as Position[][][]).flat();
}

/**
 * A country's own on-the-ground width/height, in equal-earth projected
 * units — measured through a projection rotated to that country's own
 * centroid, so a country whose mainland itself crosses the antimeridian
 * (Russia's Chukotka peninsula) reports its true size instead of the huge,
 * seam-inflated width a shared, differently-centered projection would give
 * it (the same problem CountryOutline solves for a single country's icon).
 */
function selfMeasuredSize(centroid: [number, number], geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Position[][] | Position[][][] }) {
  const selfRotated = geoEqualEarth().rotate([-centroid[0], 0]);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const ring of ringsOf(geometry)) {
    for (const point of ring) {
      const projected = selfRotated(point as [number, number]);
      if (!projected) continue;
      const [x, y] = projected;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  return { halfWidth: (maxX - minX) / 2, halfHeight: (maxY - minY) / 2 };
}

// Russia is classified as "Europe" by this dataset's region field, and is
// counted as one everywhere else in the app (search, filtering). But it's
// so large — spanning both a huge chunk of longitude and roughly 36° of
// latitude — that including its true extent in the *framing* fit forces
// "jump to Europe" to zoom out far more than makes sense, dwarfing every
// other member. Excluded from this bounds computation only: the region
// frames tightly around the rest of Europe instead, matching the other
// five regions' scale, and Russia simply extends off the edge of that view
// rather than being what the view sizes itself around.
const FRAMING_EXCLUDED_SLUGS = new Set(['russia']);

/**
 * Center + zoom to frame a region, computed from the real geographic bounds
 * of every country in it — each country's largest landmass only (via
 * getCountryPrimaryShape), so an exclave like French Guiana can't blow
 * Europe's bounds out towards South America the way a naive whole-country
 * shape would.
 *
 * Each country contributes its own true size (see selfMeasuredSize) placed
 * at its centroid's position within a projection rotated to the region's
 * own circular-mean longitude — rather than that country's raw vertices
 * projected straight through the region's rotation. Without this, a single
 * member whose own mainland crosses the antimeridian (Russia) would still
 * register its huge, seam-inflated raw width against the *region's* bounds
 * even though its true footprint is unremarkable. This is the same
 * antimeridian class of bug fixed for individual countries in
 * getCountryPrimaryShape/CountryOutline, encountered again one level up.
 * The resulting zoom is still only applied to the real (unrotated) map as
 * an estimate, since the live map can't itself be rotated per view.
 */
export function getRegionFraming(id: RegionId): RegionFraming | undefined {
  if (FRAMING_CACHE.has(id)) return FRAMING_CACHE.get(id) ?? undefined;

  const shapes = countriesInRegion(id)
    .filter((c) => !FRAMING_EXCLUDED_SLUGS.has(c.slug))
    .map((c) => getCountryPrimaryShape(c.ccn3))
    .filter((s): s is NonNullable<typeof s> => !!s);

  let result: RegionFraming | null = null;

  if (shapes.length > 0) {
    let sinSum = 0;
    let cosSum = 0;
    let latSum = 0;
    for (const s of shapes) {
      const lonRad = (s.centroid[0] * Math.PI) / 180;
      sinSum += Math.sin(lonRad);
      cosSum += Math.cos(lonRad);
      latSum += s.centroid[1];
    }
    const centralLon = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
    const centralLat = latSum / shapes.length;

    const measure = geoEqualEarth()
      .rotate([-centralLon, 0])
      .translate([WORLD_VIEWBOX_WIDTH / 2, WORLD_VIEWBOX_HEIGHT / 2]);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of shapes) {
      const size = selfMeasuredSize(s.centroid, s.feature.geometry);
      const center = measure(s.centroid);
      if (!size || !center) continue;
      const [cx, cy] = center;
      if (cx - size.halfWidth < minX) minX = cx - size.halfWidth;
      if (cx + size.halfWidth > maxX) maxX = cx + size.halfWidth;
      if (cy - size.halfHeight < minY) minY = cy - size.halfHeight;
      if (cy + size.halfHeight > maxY) maxY = cy + size.halfHeight;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    if (width > 0 && height > 0) {
      const zoom = Math.min((WORLD_VIEWBOX_WIDTH * FIT_PADDING) / width, (WORLD_VIEWBOX_HEIGHT * FIT_PADDING) / height);
      const normalizedLon = ((centralLon + 540) % 360) - 180;
      result = {
        center: [normalizedLon, centralLat],
        zoom: Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM),
      };
    }
  }

  FRAMING_CACHE.set(id, result);
  return result ?? undefined;
}
