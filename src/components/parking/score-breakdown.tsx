import type { ParkingScore, Priority } from '@/types';
import { PRIORITY_WEIGHTS } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ScoreBreakdownProps {
  score: ParkingScore;
  priority: Priority;
}

const DIMENSIONS: Array<{ key: keyof ParkingScore & string; label: string }> = [
  { key: 'costScore', label: 'Costo' },
  { key: 'walkingScore', label: 'Distanza a piedi' },
  { key: 'totalTimeScore', label: 'Tempo totale' },
  { key: 'convenienceScore', label: 'Comodità' },
  { key: 'riskScore', label: 'Rischio (basso è meglio)' },
  { key: 'confidenceScore', label: 'Affidabilità dati' },
];

const WEIGHT_KEY: Record<string, keyof (typeof PRIORITY_WEIGHTS)['balanced']> = {
  costScore: 'cost',
  walkingScore: 'walking',
  totalTimeScore: 'totalTime',
  convenienceScore: 'convenience',
  riskScore: 'risk',
  confidenceScore: 'confidence',
};

/** Mostra come è stato calcolato il punteggio: dimensioni, valori e pesi. */
export function ScoreBreakdown({ score, priority }: ScoreBreakdownProps) {
  const weights = PRIORITY_WEIGHTS[priority];
  return (
    <div className="space-y-3">
      {DIMENSIONS.map((d) => {
        const value = score[d.key] as number;
        const weight = weights[WEIGHT_KEY[d.key]!];
        return (
          <div key={d.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">{d.label}</span>
              <span className="text-text-secondary">
                {value}/100 · peso {Math.round(weight * 100)}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-background"
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={d.label}
            >
              <div
                className={cn(
                  'h-full rounded-full',
                  value >= 66 ? 'bg-green' : value >= 40 ? 'bg-primary' : 'bg-yellow',
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
