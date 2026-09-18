import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import worldTopology from 'world-atlas/countries-110m.json';

const topology = worldTopology as unknown as Topology;
const countriesObject = topology.objects.countries as GeometryCollection;
const countryFeatures = feature(topology, countriesObject) as unknown as FeatureCollection<Geometry>;

const FEATURE_BY_CCN3 = new Map<string, Feature<Geometry>>(
  countryFeatures.features.map((f) => [String(f.id), f])
);

export function getCountryFeature(ccn3: string): Feature<Geometry> | undefined {
  return FEATURE_BY_CCN3.get(ccn3);
}

export { worldTopology, countryFeatures };
