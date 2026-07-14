import type { Parking, ParkingScore, ScoredParking, SearchPreferences } from '@/types';
import { PRIORITY_WEIGHTS } from './weights';
import { checkCompatibility } from './compatibility';
import { generateExplanation, generateProsCons } from './pros-cons';

/**
 * Scoring engine: funzione pura, testabile, separata dalla UI.
 * Restituisce un punteggio 0–100 normalizzato rispetto al gruppo risultante.
 */

const CONFIDENCE_VALUE: Record<Parking['dataConfidence'], number> = {
  low: 0.4,
  medium: 0.7,
  high: 1,
};

/** Normalizzazione min-max; se il range è nullo tutti ottengono 1. */
function normalize(value: number, min: number, max: number, invert: boolean): number {
  if (max === min) return 1;
  const ratio = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));
  return invert ? 1 - clamped : clamped;
}

/** Comodità 0–1: coperto, prenotabile, H24, accessibile, EV (se richiesto). */
function convenienceValue(parking: Parking, prefs: SearchPreferences): number {
  let score = 0;
  let max = 0;

  score += parking.isCovered ? 1 : 0;
  max += 1;
  score += parking.isBookable ? 1 : 0;
  max += 1;
  score += parking.isOpen24Hours ? 1 : 0;
  max += 1;
  score += parking.isAccessible ? 0.5 : 0;
  max += 0.5;

  const needsEv = prefs.needsEvCharging || prefs.vehicleType === 'electric';
  if (needsEv) {
    score += parking.hasEvCharging ? 1 : 0;
    max += 1;
  }
  if (prefs.needsAccessibility) {
    score += parking.isAccessible ? 1 : 0;
    max += 1;
  }

  return max === 0 ? 0.5 : score / max;
}

/**
 * Rischio 0–1 dove 1 = basso rischio (buono).
 * Penalizza ZTL, incompatibilità veicolo, orario insufficiente, dati poco affidabili,
 * assenza di informazioni essenziali.
 */
function riskValue(parking: Parking, prefs: SearchPreferences, isOpenForStay: boolean): number {
  let penalty = 0;
  if (!parking.isOutsideZtl) penalty += 0.35;
  if (!isOpenForStay) penalty += 0.4;
  if (parking.dataConfidence === 'low') penalty += 0.2;
  if (!parking.isBookable) penalty += 0.1;
  if (parking.maxVehicleHeightCm === undefined) penalty += 0.05;
  if (
    parking.maxVehicleHeightCm !== undefined &&
    prefs.vehicleHeightCm !== undefined &&
    prefs.vehicleHeightCm > parking.maxVehicleHeightCm
  ) {
    penalty += 0.5;
  }
  return Math.max(0, 1 - penalty);
}

export function calculateParkingScore(
  parking: Parking,
  group: Parking[],
  prefs: SearchPreferences,
): ParkingScore {
  const weights = PRIORITY_WEIGHTS[prefs.priority];
  const compat = checkCompatibility(parking, prefs);

  // Solo i parcheggi con prezzo noto entrano nella normalizzazione del costo.
  const knownPrices = group
    .filter((p) => p.hasKnownPrice !== false)
    .map((p) => p.estimatedTotalPrice);
  const walks = group.map((p) => p.walkingDistanceMeters);
  const totals = group.map((p) => p.totalDurationMinutes);

  // Prezzo sconosciuto → punteggio costo neutro (non è né il migliore né il peggiore).
  const costScore =
    parking.hasKnownPrice === false || knownPrices.length === 0
      ? 0.5
      : normalize(
          parking.estimatedTotalPrice,
          Math.min(...knownPrices),
          Math.max(...knownPrices),
          true,
        );
  const walkingScore = normalize(
    parking.walkingDistanceMeters,
    Math.min(...walks),
    Math.max(...walks),
    true,
  );
  const totalTimeScore = normalize(
    parking.totalDurationMinutes,
    Math.min(...totals),
    Math.max(...totals),
    true,
  );
  const convenienceScore = convenienceValue(parking, prefs);
  const riskScore = riskValue(parking, prefs, compat.isOpenForStay);
  const confidenceScore = CONFIDENCE_VALUE[parking.dataConfidence];

  let weighted =
    weights.cost * costScore +
    weights.walking * walkingScore +
    weights.totalTime * totalTimeScore +
    weights.convenience * convenienceScore +
    weights.risk * riskScore +
    weights.confidence * confidenceScore;

  // Penalità forte per incompatibilità: non deve competere con le opzioni valide.
  if (compat.isIncompatible) {
    weighted *= 0.35;
  }

  const total = Math.round(Math.max(0, Math.min(1, weighted)) * 100);
  const { pros, cons } = generateProsCons(parking, group, prefs);
  const explanation = generateExplanation(parking, group, prefs);

  return {
    total,
    costScore: Math.round(costScore * 100),
    walkingScore: Math.round(walkingScore * 100),
    totalTimeScore: Math.round(totalTimeScore * 100),
    convenienceScore: Math.round(convenienceScore * 100),
    riskScore: Math.round(riskScore * 100),
    confidenceScore: Math.round(confidenceScore * 100),
    pros,
    cons,
    explanation,
  };
}

/**
 * Calcola i punteggi per l'intero gruppo e restituisce la lista ordinata.
 * Le opzioni incompatibili finiscono sempre in coda e non sono consigliabili.
 */
export function scoreAndRankParkings(
  parkings: Parking[],
  prefs: SearchPreferences,
): ScoredParking[] {
  if (parkings.length === 0) return [];

  const scored: ScoredParking[] = parkings.map((parking) => {
    const compat = checkCompatibility(parking, prefs);
    return {
      parking,
      score: calculateParkingScore(parking, parkings, prefs),
      isIncompatible: compat.isIncompatible,
      incompatibilityReasons: compat.reasons,
    };
  });

  return scored.sort((a, b) => {
    // compatibili prima degli incompatibili
    if (a.isIncompatible !== b.isIncompatible) {
      return a.isIncompatible ? 1 : -1;
    }
    return b.score.total - a.score.total;
  });
}

/**
 * La scelta consigliata è la prima opzione compatibile con il punteggio più alto.
 * Non restituisce mai un'opzione incompatibile.
 */
export function pickRecommended(scored: ScoredParking[]): ScoredParking | null {
  const compatible = scored.filter((s) => !s.isIncompatible);
  return compatible[0] ?? null;
}

/**
 * Il piano B è la migliore alternativa compatibile diversa dalla scelta principale,
 * preferibilmente non troppo distante dalla destinazione.
 */
export function pickBackup(scored: ScoredParking[], selectedId: string): ScoredParking | null {
  const alternatives = scored.filter((s) => !s.isIncompatible && s.parking.id !== selectedId);
  return alternatives[0] ?? null;
}
