import type { DataConfidence, ScoredParking } from '@/types';

export interface ParkingFilterState {
  maxPrice?: number;
  maxWalkingDistanceMeters?: number;
  coveredOnly: boolean;
  evOnly: boolean;
  accessibleOnly: boolean;
  openForStayOnly: boolean;
  outsideZtlOnly: boolean;
  bookableOnly: boolean;
  fitsVehicleHeight: boolean;
  minConfidence?: DataConfidence;
}

export const defaultFilterState: ParkingFilterState = {
  coveredOnly: false,
  evOnly: false,
  accessibleOnly: false,
  openForStayOnly: false,
  outsideZtlOnly: false,
  bookableOnly: false,
  fitsVehicleHeight: false,
};

export type SortKey = 'recommended' | 'price' | 'distance' | 'totalTime' | 'smartScore';

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Consigliati',
  price: 'Prezzo',
  distance: 'Distanza',
  totalTime: 'Tempo totale',
  smartScore: 'Smart score',
};

const CONFIDENCE_RANK: Record<DataConfidence, number> = { low: 0, medium: 1, high: 2 };

export function applyFilters(
  items: ScoredParking[],
  filters: ParkingFilterState,
  vehicleHeightCm?: number,
): ScoredParking[] {
  return items.filter(({ parking, isIncompatible }) => {
    if (filters.maxPrice !== undefined && parking.estimatedTotalPrice > filters.maxPrice) {
      return false;
    }
    if (
      filters.maxWalkingDistanceMeters !== undefined &&
      parking.walkingDistanceMeters > filters.maxWalkingDistanceMeters
    ) {
      return false;
    }
    if (filters.coveredOnly && !parking.isCovered) return false;
    if (filters.evOnly && !parking.hasEvCharging) return false;
    if (filters.accessibleOnly && !parking.isAccessible) return false;
    if (filters.outsideZtlOnly && !parking.isOutsideZtl) return false;
    if (filters.bookableOnly && !parking.isBookable) return false;
    if (filters.openForStayOnly && isIncompatible) {
      // "aperto durante l'intera sosta" — usiamo l'esito di compatibilità
      // se l'incompatibilità dipende dall'orario di chiusura.
      // Manteniamo semplice: escludiamo gli incompatibili quando il filtro è attivo.
      return false;
    }
    if (
      filters.fitsVehicleHeight &&
      vehicleHeightCm !== undefined &&
      parking.maxVehicleHeightCm !== undefined &&
      vehicleHeightCm > parking.maxVehicleHeightCm
    ) {
      return false;
    }
    if (
      filters.minConfidence !== undefined &&
      CONFIDENCE_RANK[parking.dataConfidence] < CONFIDENCE_RANK[filters.minConfidence]
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilters(filters: ParkingFilterState): number {
  let count = 0;
  if (filters.maxPrice !== undefined) count += 1;
  if (filters.maxWalkingDistanceMeters !== undefined) count += 1;
  if (filters.coveredOnly) count += 1;
  if (filters.evOnly) count += 1;
  if (filters.accessibleOnly) count += 1;
  if (filters.openForStayOnly) count += 1;
  if (filters.outsideZtlOnly) count += 1;
  if (filters.bookableOnly) count += 1;
  if (filters.fitsVehicleHeight) count += 1;
  if (filters.minConfidence !== undefined) count += 1;
  return count;
}

export function sortParkings(items: ScoredParking[], sort: SortKey): ScoredParking[] {
  const copy = [...items];
  switch (sort) {
    case 'price':
      return copy.sort((a, b) => a.parking.estimatedTotalPrice - b.parking.estimatedTotalPrice);
    case 'distance':
      return copy.sort((a, b) => a.parking.walkingDistanceMeters - b.parking.walkingDistanceMeters);
    case 'totalTime':
      return copy.sort((a, b) => a.parking.totalDurationMinutes - b.parking.totalDurationMinutes);
    case 'smartScore':
      return copy.sort((a, b) => b.score.total - a.score.total);
    case 'recommended':
    default:
      // Già ordinati dallo scoring engine (compatibili prima, poi per punteggio).
      return copy.sort((a, b) => {
        if (a.isIncompatible !== b.isIncompatible) return a.isIncompatible ? 1 : -1;
        return b.score.total - a.score.total;
      });
  }
}
