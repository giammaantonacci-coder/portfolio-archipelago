import type { Coordinates, GeoLocation, Route } from '@/types';

export interface MapProvider {
  geocode(query: string): Promise<GeoLocation[]>;
  getDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<Route>;
  getWalkingRoute(origin: Coordinates, destination: Coordinates): Promise<Route>;
}
