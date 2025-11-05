import { BERLIN_BOUNDS, BERLIN_DISTRICTS, WEST_BERLIN_POLYGON } from '@/config';
import { Coordinate, LocationResult } from '@/types';

export function isInBerlin(lat: number, lon: number): boolean {
  return (
    lat >= BERLIN_BOUNDS.minLat &&
    lat <= BERLIN_BOUNDS.maxLat &&
    lon >= BERLIN_BOUNDS.minLon &&
    lon <= BERLIN_BOUNDS.maxLon
  );
}

// Point-in-polygon algorithm using ray casting
// https://en.wikipedia.org/wiki/Point_in_polygon
export function isPointInPolygon(lat: number, lon: number, polygon: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[j];

    const intersect =
      lon1 > lon !== lon2 > lon && lat < ((lat2 - lat1) * (lon - lon1)) / (lon2 - lon1) + lat1;

    if (intersect) inside = !inside;
  }
  return inside;
}

export function determineDistrict(lat: number, lon: number): string | null {
  for (const district of BERLIN_DISTRICTS) {
    if (isPointInPolygon(lat, lon, district.polygon)) {
      return district.name;
    }
  }
  return null;
}

export function determineLocation(lat: number, lon: number): LocationResult {
  if (!isInBerlin(lat, lon)) {
    return { status: 'not-in-berlin', district: null };
  }

  // Use point-in-polygon to check if in West Berlin
  const status = isPointInPolygon(lat, lon, WEST_BERLIN_POLYGON) ? 'west' : 'east';
  const district = determineDistrict(lat, lon);

  return { status, district };
}
