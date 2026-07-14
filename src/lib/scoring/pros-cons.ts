import type { Parking, Priority, SearchPreferences } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface ProCon {
  text: string;
  /** peso di rilevanza, usato per l'ordinamento in base alla priorità */
  relevance: number;
}

interface GroupStats {
  avgPrice: number;
  minWalking: number;
}

export function computeGroupStats(parkings: Parking[]): GroupStats {
  if (parkings.length === 0) return { avgPrice: 0, minWalking: 0 };
  const priced = parkings.filter((p) => p.hasKnownPrice !== false);
  const avgPrice =
    priced.length > 0
      ? priced.reduce((sum, p) => sum + p.estimatedTotalPrice, 0) / priced.length
      : 0;
  const minWalking = Math.min(...parkings.map((p) => p.walkingDistanceMeters));
  return { avgPrice, minWalking };
}

/** Pesi di rilevanza per dimensione a seconda della priorità scelta. */
const RELEVANCE: Record<
  Priority,
  { cost: number; walking: number; convenience: number; risk: number }
> = {
  cheapest: { cost: 3, walking: 1, convenience: 1, risk: 1 },
  closest: { cost: 1, walking: 3, convenience: 1, risk: 1 },
  balanced: { cost: 2, walking: 2, convenience: 2, risk: 2 },
  stress_free: { cost: 1, walking: 1, convenience: 3, risk: 3 },
};

/**
 * Genera pro e contro con regole deterministiche (nessun LLM).
 * Restituisce massimo 5 pro e 3 contro, ordinati per rilevanza.
 */
export function generateProsCons(
  parking: Parking,
  group: Parking[],
  prefs: SearchPreferences,
): { pros: string[]; cons: string[] } {
  const stats = computeGroupStats(group);
  const rel = RELEVANCE[prefs.priority];
  const pros: ProCon[] = [];
  const cons: ProCon[] = [];

  const priceKnown = parking.hasKnownPrice !== false;
  const knownPriced = group.filter((p) => p.hasKnownPrice !== false);
  const priceDelta = stats.avgPrice - parking.estimatedTotalPrice;
  const isCheapest =
    priceKnown &&
    knownPriced.length > 0 &&
    parking.estimatedTotalPrice === Math.min(...knownPriced.map((p) => p.estimatedTotalPrice));
  const isClosest = parking.walkingDistanceMeters === stats.minWalking;

  // --- PRO ---
  if (priceKnown && parking.estimatedTotalPrice === 0) {
    pros.push({ text: 'Il parcheggio è gratuito.', relevance: rel.cost + 1 });
  } else if (priceKnown && priceDelta > 0.5) {
    pros.push({
      text: `Costa ${formatPrice(priceDelta)} meno della media.`,
      relevance: rel.cost + (isCheapest ? 1 : 0),
    });
  }
  if (isClosest) {
    pros.push({
      text: 'È il parcheggio più vicino alla destinazione.',
      relevance: rel.walking + 1,
    });
  }
  if (parking.walkingDurationMinutes <= 6) {
    pros.push({
      text: `Richiede solo ${parking.walkingDurationMinutes} minuti a piedi.`,
      relevance: rel.walking,
    });
  }
  if (parking.isOutsideZtl) {
    pros.push({ text: 'Non richiede l’ingresso in ZTL.', relevance: rel.risk });
  }
  if (parking.isCovered) {
    pros.push({ text: 'È coperto.', relevance: rel.convenience });
  }
  if (parking.isBookable) {
    pros.push({ text: 'È prenotabile.', relevance: rel.convenience });
  }
  if (parking.isOpen24Hours) {
    pros.push({ text: 'È aperto 24 ore su 24.', relevance: rel.convenience - 1 });
  }
  if (parking.hasEvCharging && (prefs.needsEvCharging || prefs.vehicleType === 'electric')) {
    pros.push({ text: 'Dispone di ricarica elettrica.', relevance: rel.convenience + 1 });
  }
  if (parking.isAccessible && prefs.needsAccessibility) {
    pros.push({ text: 'È accessibile.', relevance: rel.convenience + 1 });
  }
  if (parking.dataConfidence === 'high') {
    pros.push({ text: 'Ha un’elevata affidabilità dei dati.', relevance: 1 });
  }
  if (
    parking.maxVehicleHeightCm === undefined ||
    prefs.vehicleHeightCm === undefined ||
    prefs.vehicleHeightCm <= parking.maxVehicleHeightCm
  ) {
    if (prefs.vehicleType) {
      pros.push({ text: 'È compatibile con il tuo veicolo.', relevance: 1 });
    }
  }

  // --- CONTRO ---
  if (!priceKnown) {
    cons.push({ text: 'La tariffa non è disponibile: verificala sul posto.', relevance: rel.cost });
  } else if (priceDelta < -0.5) {
    cons.push({
      text: `Costa ${formatPrice(-priceDelta)} più della media.`,
      relevance: rel.cost,
    });
  }
  if (parking.walkingDurationMinutes > 15) {
    cons.push({
      text: 'Richiede oltre 15 minuti a piedi.',
      relevance: rel.walking + 1,
    });
  }
  if (!parking.isCovered) {
    cons.push({ text: 'È scoperto.', relevance: rel.convenience - 1 });
  }
  if (!parking.isBookable) {
    cons.push({ text: 'La disponibilità non è garantita.', relevance: rel.risk });
  }
  if (!parking.isOutsideZtl) {
    cons.push({ text: 'Il percorso passa vicino a una ZTL.', relevance: rel.risk + 1 });
  }
  if (parking.dataConfidence === 'low') {
    cons.push({
      text: 'I dati non sono stati verificati di recente.',
      relevance: 2,
    });
  }
  if ((prefs.needsEvCharging || prefs.vehicleType === 'electric') && !parking.hasEvCharging) {
    cons.push({ text: 'Non dispone di ricarica elettrica.', relevance: rel.convenience + 1 });
  }
  if (parking.maxVehicleHeightCm !== undefined && prefs.vehicleHeightCm === undefined) {
    cons.push({ text: 'Ha un limite di altezza da verificare.', relevance: 1 });
  }

  const sortByRelevance = (a: ProCon, b: ProCon) => b.relevance - a.relevance;

  return {
    pros: pros
      .sort(sortByRelevance)
      .slice(0, 5)
      .map((p) => p.text),
    cons: cons
      .sort(sortByRelevance)
      .slice(0, 3)
      .map((c) => c.text),
  };
}

/** Spiegazione sintetica in una frase, coerente con priorità e dati. */
export function generateExplanation(
  parking: Parking,
  group: Parking[],
  prefs: SearchPreferences,
): string {
  const stats = computeGroupStats(group);
  const priceKnown = parking.hasKnownPrice !== false;
  const priceDelta = stats.avgPrice - parking.estimatedTotalPrice;
  const cheaperPart =
    priceKnown && parking.estimatedTotalPrice === 0
      ? 'è gratuito'
      : priceKnown && priceDelta > 0.5
        ? `costa ${formatPrice(priceDelta)} meno della media`
        : null;
  const walkPart = `richiede soltanto ${parking.walkingDurationMinutes} minuti a piedi`;

  const lead: Record<Priority, string> = {
    cheapest: 'È tra le opzioni più convenienti per questa sosta.',
    closest: 'È tra le opzioni più vicine alla tua destinazione.',
    balanced: 'È la scelta con il miglior equilibrio tra costo, distanza e facilità di accesso.',
    stress_free: 'È l’opzione più prevedibile e a basso stress.',
  };

  const detail = [cheaperPart, walkPart].filter(Boolean).join(' e ');
  return `${lead[prefs.priority]} ${detail.charAt(0).toUpperCase() + detail.slice(1)}.`;
}
