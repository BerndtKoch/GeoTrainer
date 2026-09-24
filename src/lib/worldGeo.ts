import { feature } from 'topojson-client';
import { geoArea, geoCentroid, geoDistance } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import worldTopology from 'world-atlas/countries-50m.json';

const topology = worldTopology as unknown as Topology;
const countriesObject = topology.objects.countries as GeometryCollection;
const countryFeatures = feature(topology, countriesObject) as unknown as FeatureCollection<Geometry>;

// A handful of ISO numeric codes are shared by more than one entry in this
// dataset — e.g. Australia and "Ashmore and Cartier Is." (an uninhabited
// external territory) both carry id "036". Naively keying a Map by id lets
// whichever one comes later in the array silently win, which is how
// Australia's shape got replaced by a tiny 5-point rectangle. Keep the
// largest-area entry per id instead, so the sovereign country always wins
// over a small associated territory sharing its code.
const FEATURE_BY_CCN3 = new Map<string, Feature<Geometry>>();
for (const f of countryFeatures.features) {
  const id = String(f.id);
  const existing = FEATURE_BY_CCN3.get(id);
  if (!existing || totalArea(f.geometry) > totalArea(existing.geometry)) {
    FEATURE_BY_CCN3.set(id, f);
  }
}

function totalArea(geometry: Geometry): number {
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.reduce(
      (sum, coordinates) => sum + geoArea({ type: 'Polygon', coordinates }),
      0
    );
  }
  if (geometry.type === 'Polygon') {
    return geoArea(geometry);
  }
  return 0;
}

export interface PrimaryShape {
  /** The largest landmass, plus any other part close enough to belong in
   * the same silhouette — distant exclaves dropped. */
  feature: Feature<Polygon | MultiPolygon>;
  /** Centroid of the largest landmass, also useful as a projection rotation center. */
  centroid: [number, number];
}

const PRIMARY_SHAPE_BY_CCN3 = new Map<string, PrimaryShape | null>();

export function getCountryFeature(ccn3: string): Feature<Geometry> | undefined {
  return FEATURE_BY_CCN3.get(ccn3);
}

const EARTH_RADIUS_KM = 6371;
// A distant exclave (French Guiana from France, Hawaii/Alaska from the
// contiguous US, Réunion) sits thousands of km from the mainland. A close
// archipelago's other islands (Hokkaido/Kyushu from Honshu, New Zealand's
// North Island from the South, Corsica from mainland France) sit at most a
// few hundred km away. This threshold sits comfortably between the two.
const NEARBY_PART_KM = 1800;

/**
 * The country's largest landmass, plus any other part close enough to
 * belong in the same silhouette, standing in for the whole country where a
 * quick silhouette or a single label point is needed.
 *
 * A plain area-weighted centroid (or projection fit) across every part of a
 * multi-part country can be badly wrong in two different ways:
 * - A mainland bundled with a small, far-flung exclave (e.g. France +
 *   French Guiana, or the US + Hawaii/the Aleutians in this dataset) pulls
 *   the centroid off into open ocean, and blows out any bounding-box-based
 *   fit (the map label, the card's outline icon) across nearly the whole
 *   globe instead of just the country's own extent.
 * - A country whose mainland itself straddles the antimeridian (Russia,
 *   whose Chukotka peninsula crosses 180°) breaks naive min/max-longitude
 *   bounds even for that one landmass alone, with no exclave involved.
 *
 * Keeping only parts within NEARBY_PART_KM of the largest one fixes the
 * first case while still keeping a close archipelago's other islands
 * (Japan, New Zealand, Denmark) in the silhouette. The antimeridian case
 * needs the consumer to also rotate its projection to center on this
 * shape's own centroid longitude before measuring/fitting it — see
 * CountryOutline, which does exactly that.
 */
export function getCountryPrimaryShape(ccn3: string): PrimaryShape | undefined {
  if (PRIMARY_SHAPE_BY_CCN3.has(ccn3)) return PRIMARY_SHAPE_BY_CCN3.get(ccn3) ?? undefined;

  const feat = FEATURE_BY_CCN3.get(ccn3);
  let result: PrimaryShape | null = null;

  if (feat) {
    const parts: Position[][][] =
      feat.geometry.type === 'MultiPolygon'
        ? feat.geometry.coordinates
        : feat.geometry.type === 'Polygon'
          ? [feat.geometry.coordinates]
          : [];

    const partFeatures = parts.map(
      (coordinates): Feature<Polygon> => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates },
      })
    );

    let bestIndex = -1;
    let bestArea = -Infinity;
    partFeatures.forEach((f, i) => {
      const area = geoArea(f.geometry);
      if (area > bestArea) {
        bestArea = area;
        bestIndex = i;
      }
    });

    if (bestIndex !== -1) {
      const primaryCentroid = geoCentroid(partFeatures[bestIndex]);

      if (!Number.isNaN(primaryCentroid[0]) && !Number.isNaN(primaryCentroid[1])) {
        const keptCoordinates = partFeatures
          .filter((f, i) => {
            if (i === bestIndex) return true;
            const centroid = geoCentroid(f);
            if (Number.isNaN(centroid[0]) || Number.isNaN(centroid[1])) return false;
            const distanceKm = geoDistance(centroid, primaryCentroid) * EARTH_RADIUS_KM;
            return distanceKm <= NEARBY_PART_KM;
          })
          .map((f) => f.geometry.coordinates);

        const combinedFeature: Feature<Polygon | MultiPolygon> =
          keptCoordinates.length === 1
            ? { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: keptCoordinates[0] } }
            : { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: keptCoordinates } };

        result = { feature: combinedFeature, centroid: primaryCentroid };
      }
    }
  }

  PRIMARY_SHAPE_BY_CCN3.set(ccn3, result);
  return result ?? undefined;
}

/**
 * [longitude, latitude] centroid of a country's largest landmass, for map
 * label placement (see getCountryPrimaryShape for why "largest landmass"
 * rather than the whole, possibly multi-part, country).
 */
export function getCountryCentroid(ccn3: string): [number, number] | undefined {
  return getCountryPrimaryShape(ccn3)?.centroid;
}

export { worldTopology, countryFeatures };
