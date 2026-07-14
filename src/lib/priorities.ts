import { PiggyBank, MapPin, Scale, Leaf, type LucideIcon } from 'lucide-react';
import type { Priority } from '@/types';

export interface PriorityMeta {
  value: Priority;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

export const PRIORITIES: PriorityMeta[] = [
  {
    value: 'cheapest',
    label: 'Più conveniente',
    description: 'Favorisce il costo minore.',
    icon: PiggyBank,
    tone: 'bg-green-soft text-[#2b8f55]',
  },
  {
    value: 'closest',
    label: 'Più vicino',
    description: 'Favorisce la distanza a piedi minore.',
    icon: MapPin,
    tone: 'bg-blue-soft text-[#2f6dbd]',
  },
  {
    value: 'balanced',
    label: 'Miglior compromesso',
    description: 'Bilancia prezzo, tempi e comodità.',
    icon: Scale,
    tone: 'bg-purple-soft text-primary',
  },
  {
    value: 'stress_free',
    label: 'Zero stress',
    description: 'Facilità di accesso, no ZTL, copertura e prevedibilità.',
    icon: Leaf,
    tone: 'bg-[#fff5e5] text-[#b5791b]',
  },
];

export function getPriorityMeta(value: Priority): PriorityMeta {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[2]!;
}
