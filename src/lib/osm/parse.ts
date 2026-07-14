import type { Coordinates, DataConfidence, Parking } from '@/types';
import { haversineMeters } from '@/lib/geo';

/** Elemento restituito dall'API Overpass. */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OsmParseContext {
  destination: Coordinates;
  origin?: Coordinates;
  /** Durata della sosta in minuti, per stimare il costo totale quando c'è una tariffa oraria. */
  durationMinutes: number;
}

/** Costruisce la query Overpass per i parcheggi entro `radius` metri dal punto. */
export function buildOverpassQuery(lat: number, lng: number, radiusMeters: number): string {
  const r = Math.max(150, Math.min(3000, Math.round(radiusMeters)));
  return `[out:json][timeout:25];
(
  nwr[amenity=parking][access!=private][access!=no](around:${r},${lat},${lng});
);
out center tags 60;`;
}

/** Estrae le coordinate da un elemento Overpass (node oppure way/relation con center). */
function elementCoords(el: OverpassElement): Coordinates | null {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') {
    return { latitude: el.lat, longitude: el.lon };
  }
  if (el.center) return { latitude: el.center.lat, longitude: el.center.lon };
  return null;
}

/** Prova a interpretare `maxheight` (es. "2.1", "2.1 m", "210 cm") in centimetri. */
export function parseMaxHeightCm(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cm = /([\d.]+)\s*cm/i.exec(value);
  if (cm && cm[1]) return Math.round(Number.parseFloat(cm[1]));
  const m = /([\d.]+)/.exec(value);
  if (m && m[1]) {
    const n = Number.parseFloat(m[1]);
    if (Number.isFinite(n)) return n > 20 ? Math.round(n) : Math.round(n * 100);
  }
  return undefined;
}

/** Prova a interpretare una tariffa oraria da `charge` / `fee:conditional`. */
export function parseHourlyCharge(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = /([\d.,]+)\s*(?:eur|€)?\s*\/?\s*(?:h|hour|ora|hr)/i.exec(value);
  if (match && match[1]) {
    const n = Number.parseFloat(match[1].replace(',', '.'));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function isTrue(value: string | undefined): boolean {
  return value === 'yes' || value === 'true' || value === '1';
}

function computeConfidence(tags: Record<string, string>): DataConfidence {
  let signals = 0;
  if (tags.name) signals += 1;
  if (tags.fee !== undefined) signals += 1;
  if (tags.capacity) signals += 1;
  if (tags.opening_hours) signals += 1;
  if (signals >= 3) return 'medium';
  return 'low';
}

function buildTags(parking: Omit<Parking, 'tags'>): string[] {
  const tags: string[] = [];
  if (parking.hasKnownPrice !== false && parking.estimatedTotalPrice === 0) tags.push('Gratuito');
  if (parking.isCovered) tags.push('Coperto');
  else tags.push('Scoperto');
  if (parking.hasEvCharging) tags.push('EV');
  if (parking.isAccessible) tags.push('Accessibile');
  if (parking.isOpen24Hours) tags.push('H24');
  if (parking.maxVehicleHeightCm !== undefined && parking.maxVehicleHeightCm < 210) {
    tags.push('Altezza limitata');
  }
  tags.push(parking.hasKnownPrice === false ? 'Dato stimato' : 'Dato OSM');
  return tags.slice(0, 5);
}

/**
 * Converte un elemento OSM (amenity=parking) nel modello Parking.
 * Distanze e tempi sono derivati dalle coordinate REALI; le tariffe assenti in
 * OSM restano marcate come non note (hasKnownPrice = false) — nessun prezzo inventato.
 */
export function osmElementToParking(el: OverpassElement, ctx: OsmParseContext): Parking | null {
  const coords = elementCoords(el);
  if (!coords) return null;
  const tags = el.tags ?? {};

  const walkingStraight = haversineMeters(coords, ctx.destination);
  const walkingDistanceMeters = Math.round(walkingStraight * 1.25);
  const walkingDurationMinutes = Math.max(1, Math.round(walkingDistanceMeters / 80));

  const drivingMeters = ctx.origin
    ? haversineMeters(ctx.origin, coords) * 1.4
    : walkingStraight * 1.2 + 1500;
  const drivingDurationMinutes = Math.max(2, Math.round(drivingMeters / 450));

  // Prezzo
  const parkingKind = tags.parking ?? '';
  const isCovered =
    isTrue(tags.covered) || ['underground', 'multi-storey', 'garage'].includes(parkingKind);
  const hourly = parseHourlyCharge(tags.charge ?? tags['fee:conditional']);
  let estimatedTotalPrice = 0;
  let hasKnownPrice = false;
  if (tags.fee === 'no') {
    estimatedTotalPrice = 0;
    hasKnownPrice = true;
  } else if (hourly !== undefined) {
    estimatedTotalPrice = Math.round(hourly * (ctx.durationMinutes / 60) * 100) / 100;
    hasKnownPrice = true;
  }

  const maxVehicleHeightCm = parseMaxHeightCm(tags.maxheight);
  const totalSpaces = tags.capacity ? Number.parseInt(tags.capacity, 10) : undefined;

  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const name = tags.name ?? (street ? `Parcheggio ${street}` : 'Parcheggio pubblico');

  const base: Omit<Parking, 'tags'> = {
    id: `osm-${el.type}-${el.id}`,
    name,
    slug: `osm-${el.type}-${el.id}`,
    address: street || tags['addr:city'] || 'Indirizzo non disponibile',
    city: tags['addr:city'] ?? '',
    latitude: coords.latitude,
    longitude: coords.longitude,
    pricePerHour: hourly,
    estimatedTotalPrice,
    hasKnownPrice,
    currency: 'EUR',
    walkingDistanceMeters,
    walkingDurationMinutes,
    drivingDurationMinutes,
    totalDurationMinutes: walkingDurationMinutes + drivingDurationMinutes,
    isCovered,
    // OSM non espone prenotabilità: la trattiamo come non garantita.
    isBookable: false,
    hasEvCharging: 'capacity:charging' in tags || isTrue(tags.charging),
    isAccessible: tags.wheelchair === 'yes',
    isOpen24Hours: tags.opening_hours === '24/7',
    // La ZTL non è desumibile da OSM: non la affermiamo come rischio (disclaimer globale).
    isOutsideZtl: true,
    maxVehicleHeightCm,
    totalSpaces: Number.isFinite(totalSpaces) ? totalSpaces : undefined,
    dataConfidence: computeConfidence(tags),
    dataSource: 'OpenStreetMap',
    externalUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    isDemo: false,
  };

  return { ...base, tags: buildTags(base) };
}

/** Converte una risposta Overpass completa in una lista di Parking valida. */
export function overpassToParkings(elements: OverpassElement[], ctx: OsmParseContext): Parking[] {
  return elements.map((el) => osmElementToParking(el, ctx)).filter((p): p is Parking => p !== null);
}
