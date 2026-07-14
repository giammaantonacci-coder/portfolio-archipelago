import type { GeoLocation } from '@/types';

/** Destinazione demo di riferimento (coordinate simulate, città generica). */
export const DEMO_DESTINATION: GeoLocation = {
  name: 'Centro città (demo)',
  address: 'Piazza Centrale, Città Demo',
  coordinates: { latitude: 45.4642, longitude: 9.19 },
  isDemo: true,
};

export const DEMO_ORIGIN: GeoLocation = {
  name: 'La tua posizione (demo)',
  address: 'Periferia, Città Demo',
  coordinates: { latitude: 45.44, longitude: 9.22 },
  isDemo: true,
};
