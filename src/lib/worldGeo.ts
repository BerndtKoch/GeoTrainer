import { feature } from 'topojson-client';
import { geoArea, geoCentroid } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, Polygon, Position } from 'geojson';
import worldTopology from 'world-atlas/countries-50m.json';

const topology = worldTopology as unknown as Topology;
const countriesObject = topology.objects.countries as GeometryCollection;
const countryFeatures = feature(topology, countriesObject) as unknown as FeatureCollection<Geometry>;

const FEATURE_BY_CCN3 = new Map<string, Feature<Geometry>>(
  countryFeatures.features.map((f) => [String(f.id), f])
);

const CENTROID_BY_CCN3 = new Map<string, [number, number]>();

export function getCountryFeature(ccn3: string): Feature<Geometry> | undefined {
  return FEATURE_BY_CCN3.get(ccn3);
}

/**
 * [longitude, latitude] centroid of a country's shape, for map label placement.
 *
 * For a multi-part country (islands, or a mainland + an overseas exclave
 * bundled into the same feature, e.g. France + French Guiana in this
 * dataset), the plain area-weighted centroid of the whole feature can land
 * far from any actual landmass — French Guiana alone pulls France's
 * centroid out into the Atlantic. Instead, label at the centroid of the
 * single largest ring, which is always a real point on real land.
 */
export function getCountryCentroid(ccn3: string): [number, number] | undefined {
  if (CENTROID_BY_CCN3.has(ccn3)) return CENTROID_BY_CCN3.get(ccn3);
  const feat = FEATURE_BY_CCN3.get(ccn3);
  if (!feat) return undefined;

  const centroid =
    feat.geometry.type === 'MultiPolygon'
      ? largestRingCentroid(feat.geometry.coordinates)
      : geoCentroid(feat);

  if (Number.isNaN(centroid[0]) || Number.isNaN(centroid[1])) return undefined;
  CENTROID_BY_CCN3.set(ccn3, centroid);
  return centroid;
}

function largestRingCentroid(parts: Position[][][]): [number, number] {
  let bestArea = -Infinity;
  let bestCentroid: [number, number] = [NaN, NaN];
  for (const coordinates of parts) {
    const polygon: Polygon = { type: 'Polygon', coordinates };
    const area = geoArea(polygon);
    if (area > bestArea) {
      bestArea = area;
      bestCentroid = geoCentroid(polygon);
    }
  }
  return bestCentroid;
}

export { worldTopology, countryFeatures };
