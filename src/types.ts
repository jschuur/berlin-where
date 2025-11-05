export interface LocationResult {
  status: 'east' | 'west' | 'not-in-berlin';
  district: string | null;
}

export type Status = LocationResult['status'] | 'loading' | 'error' | 'pending';

export type Coordinate = [number, number];

export interface BerlinDistrict {
  name: string;
  polygon: Coordinate[];
}

export interface BerlinBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}
