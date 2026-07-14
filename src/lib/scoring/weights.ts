import type { Priority } from '@/types';

export interface ScoreWeights {
  cost: number;
  walking: number;
  totalTime: number;
  convenience: number;
  risk: number;
  confidence: number;
}

/** Pesi per ciascuna priorità (sezione 20 della specifica). */
export const PRIORITY_WEIGHTS: Record<Priority, ScoreWeights> = {
  cheapest: {
    cost: 0.45,
    walking: 0.15,
    totalTime: 0.15,
    convenience: 0.1,
    risk: 0.05,
    confidence: 0.1,
  },
  closest: {
    cost: 0.1,
    walking: 0.5,
    totalTime: 0.15,
    convenience: 0.1,
    risk: 0.05,
    confidence: 0.1,
  },
  balanced: {
    cost: 0.25,
    walking: 0.2,
    totalTime: 0.2,
    convenience: 0.15,
    risk: 0.1,
    confidence: 0.1,
  },
  stress_free: {
    cost: 0.1,
    walking: 0.15,
    totalTime: 0.15,
    convenience: 0.25,
    risk: 0.25,
    confidence: 0.1,
  },
};
