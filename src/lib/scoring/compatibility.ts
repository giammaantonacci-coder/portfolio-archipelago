import type { Parking, SearchPreferences } from '@/types';
import { addMinutesToTime, compareTimes } from '@/lib/utils';

export interface CompatibilityResult {
  isIncompatible: boolean;
  reasons: string[];
  /** true se il parcheggio risulta aperto per l'intera sosta. */
  isOpenForStay: boolean;
}

/**
 * Determina se un parcheggio è compatibile con i requisiti dell'utente.
 * Un parcheggio incompatibile NON deve mai essere mostrato come consigliato.
 */
export function checkCompatibility(
  parking: Parking,
  prefs: SearchPreferences,
): CompatibilityResult {
  const reasons: string[] = [];

  // Altezza veicolo
  if (
    parking.maxVehicleHeightCm !== undefined &&
    prefs.vehicleHeightCm !== undefined &&
    prefs.vehicleHeightCm > parking.maxVehicleHeightCm
  ) {
    reasons.push('Il tuo veicolo supera l’altezza massima consentita.');
  }

  // Van in struttura con limite di altezza tipico
  if (
    prefs.vehicleType === 'van' &&
    parking.maxVehicleHeightCm !== undefined &&
    parking.maxVehicleHeightCm < 210
  ) {
    reasons.push('Non adatto ai van per via del limite di altezza.');
  }

  // Accessibilità richiesta
  if (prefs.needsAccessibility && !parking.isAccessible) {
    reasons.push('Non è accessibile ma hai indicato di averne bisogno.');
  }

  // Ricarica EV richiesta
  const needsEv = prefs.needsEvCharging || prefs.vehicleType === 'electric';
  if (needsEv && !parking.hasEvCharging) {
    reasons.push('Non dispone di ricarica elettrica ma ti serve.');
  }

  const isOpenForStay = isOpenDuringStay(parking, prefs);
  if (!isOpenForStay) {
    reasons.push('Risulta chiuso durante parte della tua sosta.');
  }

  return {
    isIncompatible: reasons.length > 0,
    reasons,
    isOpenForStay,
  };
}

/** Verifica se il parcheggio è aperto per tutta la durata della sosta. */
export function isOpenDuringStay(parking: Parking, prefs: SearchPreferences): boolean {
  if (parking.isOpen24Hours) return true;
  if (!parking.openingTime || !parking.closingTime) return true; // sconosciuto: non penalizziamo qui

  const arrival = prefs.arrivalTime;
  const departure = addMinutesToTime(prefs.arrivalTime, prefs.durationMinutes);

  // Gestione orari che non attraversano la mezzanotte (caso comune per demo)
  const opensBeforeArrival = compareTimes(parking.openingTime, arrival) <= 0;
  const departureBeforeClose = compareTimes(departure, parking.closingTime) <= 0;
  const stayCrossesMidnight = compareTimes(departure, arrival) < 0;

  if (stayCrossesMidnight) return false;
  return opensBeforeArrival && departureBeforeClose;
}
