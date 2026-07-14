import type { Coordinates } from '@/types';

const EARTH_RADIUS_M = 6_371_000;

/** Distanza in metri tra due coordinate (formula dell'emisenoverso). */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Polilinea a 3 punti con una leggera curva, utile per un rendering gradevole. */
export function simplePolyline(a: Coordinates, b: Coordinates): Array<[number, number]> {
  const midLat = (a.latitude + b.latitude) / 2 + (b.longitude - a.longitude) * 0.06;
  const midLng = (a.longitude + b.longitude) / 2 - (b.latitude - a.latitude) * 0.06;
  return [
    [a.longitude, a.latitude],
    [midLng, midLat],
    [b.longitude, b.latitude],
  ];
}
