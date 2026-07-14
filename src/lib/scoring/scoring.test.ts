import { describe, it, expect } from 'vitest';
import type { Parking, SearchPreferences } from '@/types';
import { DEMO_PARKINGS } from '@/lib/demo/parkings';
import { PRIORITY_WEIGHTS } from './weights';
import { checkCompatibility } from './compatibility';
import { generateProsCons } from './pros-cons';
import {
  calculateParkingScore,
  scoreAndRankParkings,
  pickRecommended,
  pickBackup,
} from './calculate-parking-score';

const basePrefs: SearchPreferences = {
  destination: 'Centro',
  arrivalDate: '2026-07-20',
  arrivalTime: '10:00',
  durationMinutes: 120,
  priority: 'balanced',
};

function findParking(id: string): Parking {
  const p = DEMO_PARKINGS.find((x) => x.id === id);
  if (!p) throw new Error(`parking ${id} not found`);
  return p;
}

describe('pesi delle priorità', () => {
  it('ogni set di pesi somma a 1', () => {
    for (const key of Object.keys(PRIORITY_WEIGHTS) as Array<keyof typeof PRIORITY_WEIGHTS>) {
      const w = PRIORITY_WEIGHTS[key];
      const sum = w.cost + w.walking + w.totalTime + w.convenience + w.risk + w.confidence;
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});

describe('normalizzazione punteggi', () => {
  it('produce sempre un totale tra 0 e 100', () => {
    for (const parking of DEMO_PARKINGS) {
      const score = calculateParkingScore(parking, DEMO_PARKINGS, basePrefs);
      expect(score.total).toBeGreaterThanOrEqual(0);
      expect(score.total).toBeLessThanOrEqual(100);
    }
  });

  it('il parcheggio più economico ottiene costScore massimo', () => {
    const cheapest = [...DEMO_PARKINGS].sort(
      (a, b) => a.estimatedTotalPrice - b.estimatedTotalPrice,
    )[0]!;
    const score = calculateParkingScore(cheapest, DEMO_PARKINGS, basePrefs);
    expect(score.costScore).toBe(100);
  });

  it('il parcheggio più vicino ottiene walkingScore massimo', () => {
    const closest = [...DEMO_PARKINGS].sort(
      (a, b) => a.walkingDistanceMeters - b.walkingDistanceMeters,
    )[0]!;
    const score = calculateParkingScore(closest, DEMO_PARKINGS, basePrefs);
    expect(score.walkingScore).toBe(100);
  });
});

describe('le priorità cambiano il risultato', () => {
  it('cheapest e closest producono ordinamenti diversi', () => {
    const cheapest = scoreAndRankParkings(DEMO_PARKINGS, { ...basePrefs, priority: 'cheapest' });
    const closest = scoreAndRankParkings(DEMO_PARKINGS, { ...basePrefs, priority: 'closest' });
    expect(cheapest[0]!.parking.id).not.toBe(closest[0]!.parking.id);
  });

  it('con priorità cheapest il consigliato è tra i più economici', () => {
    const ranked = scoreAndRankParkings(DEMO_PARKINGS, { ...basePrefs, priority: 'cheapest' });
    const recommended = pickRecommended(ranked)!;
    const minPrice = Math.min(...DEMO_PARKINGS.map((p) => p.estimatedTotalPrice));
    expect(recommended.parking.estimatedTotalPrice).toBeLessThanOrEqual(minPrice + 3);
  });
});

describe('compatibilità veicolo e penalità', () => {
  it('penalizza fortemente un veicolo troppo alto', () => {
    const lowClearance = findParking('demo-basso'); // 180cm
    const prefs: SearchPreferences = { ...basePrefs, vehicleHeightCm: 205 };
    const compat = checkCompatibility(lowClearance, prefs);
    expect(compat.isIncompatible).toBe(true);

    const scoreOk = calculateParkingScore(lowClearance, DEMO_PARKINGS, basePrefs).total;
    const scoreBad = calculateParkingScore(lowClearance, DEMO_PARKINGS, prefs).total;
    expect(scoreBad).toBeLessThan(scoreOk);
  });

  it('il van è incompatibile con strutture a soffitto basso', () => {
    const lowClearance = findParking('demo-coperto'); // 190cm
    const compat = checkCompatibility(lowClearance, { ...basePrefs, vehicleType: 'van' });
    expect(compat.isIncompatible).toBe(true);
  });

  it('richiesta EV rende incompatibile un parcheggio senza ricarica', () => {
    const noEv = findParking('demo-stazione');
    const compat = checkCompatibility(noEv, { ...basePrefs, needsEvCharging: true });
    expect(compat.isIncompatible).toBe(true);
  });

  it('un parcheggio chiuso durante la sosta è incompatibile', () => {
    const limited = findParking('demo-ovest'); // 09:00–19:00
    const compat = checkCompatibility(limited, {
      ...basePrefs,
      arrivalTime: '18:30',
      durationMinutes: 120,
    });
    expect(compat.isOpenForStay).toBe(false);
    expect(compat.isIncompatible).toBe(true);
  });
});

describe('generazione pro e contro', () => {
  it('genera al massimo 5 pro e 3 contro', () => {
    for (const parking of DEMO_PARKINGS) {
      const { pros, cons } = generateProsCons(parking, DEMO_PARKINGS, basePrefs);
      expect(pros.length).toBeLessThanOrEqual(5);
      expect(cons.length).toBeLessThanOrEqual(3);
    }
  });

  it('segnala fra i pro il parcheggio più vicino', () => {
    const closest = findParking('demo-premium');
    const { pros } = generateProsCons(closest, DEMO_PARKINGS, basePrefs);
    expect(pros.some((p) => p.includes('più vicino'))).toBe(true);
  });

  it('segnala fra i contro uno scoperto e non prenotabile', () => {
    const uncovered = findParking('demo-express');
    const { cons } = generateProsCons(uncovered, DEMO_PARKINGS, basePrefs);
    expect(cons.some((c) => c.includes('scoperto'))).toBe(true);
  });
});

describe('ordinamento, consigliato e piano B', () => {
  it('gli incompatibili finiscono in coda', () => {
    const prefs: SearchPreferences = { ...basePrefs, vehicleHeightCm: 240 };
    const ranked = scoreAndRankParkings(DEMO_PARKINGS, prefs);
    const firstIncompatibleIndex = ranked.findIndex((r) => r.isIncompatible);
    const lastCompatibleIndex = ranked.map((r) => r.isIncompatible).lastIndexOf(false);
    if (firstIncompatibleIndex >= 0) {
      expect(firstIncompatibleIndex).toBeGreaterThan(lastCompatibleIndex);
    }
  });

  it('il consigliato non è mai incompatibile', () => {
    const prefs: SearchPreferences = { ...basePrefs, needsEvCharging: true };
    const ranked = scoreAndRankParkings(DEMO_PARKINGS, prefs);
    const recommended = pickRecommended(ranked)!;
    expect(recommended.isIncompatible).toBe(false);
    expect(recommended.parking.hasEvCharging).toBe(true);
  });

  it('il piano B è diverso dal consigliato ed è compatibile', () => {
    const ranked = scoreAndRankParkings(DEMO_PARKINGS, basePrefs);
    const recommended = pickRecommended(ranked)!;
    const backup = pickBackup(ranked, recommended.parking.id)!;
    expect(backup.parking.id).not.toBe(recommended.parking.id);
    expect(backup.isIncompatible).toBe(false);
  });
});
