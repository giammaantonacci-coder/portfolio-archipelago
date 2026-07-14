import type { Coordinates, GeoLocation, Route } from '@/types';
import type { MapProvider } from './map-provider';
import { haversineMeters, simplePolyline } from '@/lib/geo';

/**
 * Map provider reale senza chiavi: geocoding via Nominatim (route same-origin
 * `/api/geocode`). Il routing è stimato dalle coordinate reali (nessun server di
 * routing esterno da configurare); Mapbox resta disponibile come upgrade.
 */
export class NominatimMapProvider implements MapProvider {
  async geocode(query: string): Promise<GeoLocation[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
    if (!res.ok) throw new Error('Geocoding non riuscito.');
    const data = (await res.json()) as { results: GeoLocation[] };
    return data.results;
  }

  async getDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    const distance = haversineMeters(origin, destination) * 1.4;
    return {
      distanceMeters: Math.round(distance),
      durationMinutes: Math.max(2, Math.round(distance / 450)),
      geometry: simplePolyline(origin, destination),
      mode: 'driving',
    };
  }

  async getWalkingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    const distance = haversineMeters(origin, destination) * 1.25;
    return {
      distanceMeters: Math.round(distance),
      durationMinutes: Math.max(1, Math.round(distance / 80)),
      geometry: simplePolyline(origin, destination),
      mode: 'walking',
    };
  }
}
