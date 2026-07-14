import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Converte HH:mm in minuti dalla mezzanotte (0 se non valido). */
function timeToMinutes(time: string): number {
  const parts = time.split(':');
  const h = Number.parseInt(parts[0] ?? '', 10);
  const m = Number.parseInt(parts[1] ?? '', 10);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/** Somma minuti a un orario HH:mm e restituisce HH:mm. */
export function addMinutesToTime(time: string, minutes: number): string {
  const base = timeToMinutes(time);
  const total = (((base + Math.round(minutes)) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Confronta due orari HH:mm: negativo se a < b. */
export function compareTimes(a: string, b: string): number {
  return timeToMinutes(a) - timeToMinutes(b);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Sanitizza un input testuale libero (destinazione/note) rimuovendo tag. */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 240);
}

let idCounter = 0;
export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}
