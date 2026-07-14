/**
 * Parqo domain model.
 * Questi tipi sono la fonte di verità condivisa tra scoring engine, provider e UI.
 */

export type Currency = 'EUR';

export type DataConfidence = 'low' | 'medium' | 'high';

export type Priority = 'cheapest' | 'closest' | 'balanced' | 'stress_free';

export type VehicleType = 'city_car' | 'sedan' | 'suv' | 'van' | 'electric';

export type PlanStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface Parking {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerHour?: number;
  dailyMaxPrice?: number;
  estimatedTotalPrice: number;
  /**
   * false quando la tariffa reale non è nota (es. dato OSM senza prezzo):
   * in questo caso estimatedTotalPrice non è affidabile e non va mostrato come
   * prezzo reale né usato per proporre l'opzione come "più conveniente".
   * Assente/true = prezzo noto.
   */
  hasKnownPrice?: boolean;
  currency: Currency;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  drivingDurationMinutes: number;
  totalDurationMinutes: number;
  isCovered: boolean;
  isBookable: boolean;
  hasEvCharging: boolean;
  isAccessible: boolean;
  isOpen24Hours: boolean;
  isOutsideZtl: boolean;
  /** Ora di apertura/chiusura in formato HH:mm quando non è H24 */
  openingTime?: string;
  closingTime?: string;
  maxVehicleHeightCm?: number;
  totalSpaces?: number;
  dataConfidence: DataConfidence;
  dataSource: string;
  lastVerifiedAt?: string;
  imageUrl?: string;
  externalUrl?: string;
  tags: string[];
  isDemo: boolean;
}

export interface SearchPreferences {
  destination: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  origin?: string;
  originLatitude?: number;
  originLongitude?: number;
  arrivalDate: string;
  arrivalTime: string;
  durationMinutes: number;
  priority: Priority;
  maxPrice?: number;
  maxWalkingDistanceMeters?: number;
  vehicleType?: VehicleType;
  vehicleHeightCm?: number;
  needsAccessibility?: boolean;
  needsEvCharging?: boolean;
}

export interface ParkingScore {
  total: number;
  costScore: number;
  walkingScore: number;
  totalTimeScore: number;
  convenienceScore: number;
  riskScore: number;
  confidenceScore: number;
  pros: string[];
  cons: string[];
  explanation: string;
}

/** Parcheggio arricchito con il punteggio calcolato per una specifica ricerca. */
export interface ScoredParking {
  parking: Parking;
  score: ParkingScore;
  /** true se il parcheggio è incompatibile con i requisiti (non consigliabile). */
  isIncompatible: boolean;
  incompatibilityReasons: string[];
}

export interface ParkingPlan {
  id: string;
  userId?: string;
  searchPreferences: SearchPreferences;
  selectedParking: Parking;
  backupParking?: Parking;
  estimatedArrivalTime?: string;
  note?: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocation {
  name: string;
  address?: string;
  coordinates: Coordinates;
  isDemo?: boolean;
}

export interface Route {
  distanceMeters: number;
  durationMinutes: number;
  /** Punti [lng, lat] per il rendering; in demo è una polilinea semplificata. */
  geometry: Array<[number, number]>;
  mode: 'driving' | 'walking';
  isDemo?: boolean;
}

export type FavoriteKind = 'parking' | 'destination' | 'search';

export interface Favorite {
  id: string;
  kind: FavoriteKind;
  label: string;
  createdAt: string;
  parking?: Parking;
  destination?: GeoLocation;
  search?: SearchPreferences;
  isDemo: boolean;
}

export interface VehicleProfile {
  type?: VehicleType;
  heightCm?: number;
  lengthCm?: number;
}

export interface UserProfile {
  name?: string;
  email?: string;
  vehicle?: VehicleProfile;
  needsAccessibility?: boolean;
  defaultPriority?: Priority;
  maxWalkingDistanceMeters?: number;
  maxBudget?: number;
}
