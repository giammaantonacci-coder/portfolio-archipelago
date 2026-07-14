import type { Coordinates } from '@/types';

/**
 * Deep link verso app di navigazione esterne. Non costruiamo un sistema
 * turn-by-turn proprietario: deleghiamo a Google/Apple Maps.
 */
export function googleMapsLink(destination: Coordinates, origin?: Coordinates): string {
  const dest = `${destination.latitude},${destination.longitude}`;
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', dest);
  url.searchParams.set('travelmode', 'driving');
  if (origin) url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`);
  return url.toString();
}

export function appleMapsLink(destination: Coordinates, origin?: Coordinates): string {
  const params = new URLSearchParams({
    daddr: `${destination.latitude},${destination.longitude}`,
    dirflg: 'd',
  });
  if (origin) params.set('saddr', `${origin.latitude},${origin.longitude}`);
  return `https://maps.apple.com/?${params.toString()}`;
}
