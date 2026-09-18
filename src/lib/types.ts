export type PopulationBracket = 'small' | 'medium' | 'large';

export interface CountryBorder {
  slug: string;
  name: string;
  cca3: string;
  ccn3: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export interface Country {
  slug: string;
  name: string;
  officialName: string;
  cca2: string;
  cca3: string;
  ccn3: string;
  capital: string | null;
  region: string;
  subregion: string | null;
  population: number | null;
  populationBracket: PopulationBracket | null;
  area: number | null;
  areaRank: number | null;
  landlocked: boolean;
  languages: string[];
  currencies: Currency[];
  borders: CountryBorder[];
  latlng: [number, number] | null;
  climate: string | null;
  food: string[];
  rivers: string[];
  mountains: string[];
  majorCities: string[];
  provinces: string[];
  landmarks: string[];
  brands: string[];
}

export type FieldKey =
  | 'flag'
  | 'capital'
  | 'region'
  | 'population'
  | 'borders'
  | 'outline'
  | 'languages'
  | 'currencies'
  | 'area'
  | 'climate'
  | 'rivers'
  | 'mountains'
  | 'majorCities'
  | 'provinces'
  | 'landmarks'
  | 'brands'
  | 'food';
