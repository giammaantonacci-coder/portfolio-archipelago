import { describe, it, expect } from 'vitest';
import type { OsmParseContext, OverpassElement } from './parse';
import {
  buildOverpassQuery,
  osmElementToParking,
  overpassToParkings,
  parseHourlyCharge,
  parseMaxHeightCm,
} from './parse';

const ctx: OsmParseContext = {
  destination: { latitude: 45.4642, longitude: 9.19 },
  durationMinutes: 120,
};

describe('buildOverpassQuery', () => {
  it('include amenity=parking, il raggio e le coordinate', () => {
    const q = buildOverpassQuery(45.4642, 9.19, 800);
    expect(q).toContain('amenity=parking');
    expect(q).toContain('around:800,45.4642,9.19');
    expect(q).toContain('out center');
  });

  it('limita il raggio a valori ragionevoli', () => {
    expect(buildOverpassQuery(0, 0, 50)).toContain('around:150,');
    expect(buildOverpassQuery(0, 0, 99999)).toContain('around:3000,');
  });
});

describe('parseMaxHeightCm', () => {
  it('interpreta metri e centimetri', () => {
    expect(parseMaxHeightCm('2.1')).toBe(210);
    expect(parseMaxHeightCm('2.1 m')).toBe(210);
    expect(parseMaxHeightCm('210 cm')).toBe(210);
    expect(parseMaxHeightCm(undefined)).toBeUndefined();
  });
});

describe('parseHourlyCharge', () => {
  it('estrae una tariffa oraria quando presente', () => {
    expect(parseHourlyCharge('2 EUR/hour')).toBe(2);
    expect(parseHourlyCharge('1,50 €/h')).toBe(1.5);
    expect(parseHourlyCharge('gratis')).toBeUndefined();
  });
});

describe('osmElementToParking', () => {
  it('mappa un nodo con coordinate reali e distanze derivate', () => {
    const el: OverpassElement = {
      type: 'node',
      id: 1,
      lat: 45.4652,
      lon: 9.1912,
      tags: { amenity: 'parking', name: 'Parcheggio Test', fee: 'no', capacity: '120' },
    };
    const p = osmElementToParking(el, ctx)!;
    expect(p).not.toBeNull();
    expect(p.name).toBe('Parcheggio Test');
    expect(p.isDemo).toBe(false);
    expect(p.dataSource).toBe('OpenStreetMap');
    expect(p.walkingDistanceMeters).toBeGreaterThan(0);
    expect(p.totalDurationMinutes).toBe(p.walkingDurationMinutes + p.drivingDurationMinutes);
    expect(p.totalSpaces).toBe(120);
  });

  it('marca il prezzo come non noto quando manca la tariffa', () => {
    const el: OverpassElement = {
      type: 'way',
      id: 2,
      center: { lat: 45.463, lon: 9.191 },
      tags: { amenity: 'parking', fee: 'yes' },
    };
    const p = osmElementToParking(el, ctx)!;
    expect(p.hasKnownPrice).toBe(false);
    expect(p.tags).toContain('Dato stimato');
  });

  it('riconosce gratuito, coperto, EV, accessibile e H24', () => {
    const el: OverpassElement = {
      type: 'node',
      id: 3,
      lat: 45.4643,
      lon: 9.1901,
      tags: {
        amenity: 'parking',
        fee: 'no',
        parking: 'underground',
        'capacity:charging': '4',
        wheelchair: 'yes',
        opening_hours: '24/7',
        maxheight: '1.9',
      },
    };
    const p = osmElementToParking(el, ctx)!;
    expect(p.estimatedTotalPrice).toBe(0);
    expect(p.hasKnownPrice).toBe(true);
    expect(p.isCovered).toBe(true);
    expect(p.hasEvCharging).toBe(true);
    expect(p.isAccessible).toBe(true);
    expect(p.isOpen24Hours).toBe(true);
    expect(p.maxVehicleHeightCm).toBe(190);
    expect(p.tags).toContain('Gratuito');
    expect(p.tags.length).toBeLessThanOrEqual(5);
  });

  it('scarta gli elementi senza coordinate', () => {
    const el: OverpassElement = { type: 'way', id: 4, tags: { amenity: 'parking' } };
    expect(osmElementToParking(el, ctx)).toBeNull();
  });
});

describe('overpassToParkings', () => {
  it('filtra gli elementi non validi', () => {
    const elements: OverpassElement[] = [
      { type: 'node', id: 1, lat: 45.4652, lon: 9.1912, tags: { amenity: 'parking' } },
      { type: 'way', id: 2, tags: { amenity: 'parking' } }, // senza coord → scartato
    ];
    expect(overpassToParkings(elements, ctx)).toHaveLength(1);
  });
});
