import { cn } from '@/lib/utils';

interface SmartScoreBadgeProps {
  score: number;
  size?: 'sm' | 'lg';
  className?: string;
}

function toneFor(score: number): string {
  if (score >= 75) return 'bg-green-soft text-[#2b8f55]';
  if (score >= 55) return 'bg-purple-soft text-primary';
  if (score >= 35) return 'bg-[#fff5e5] text-[#b5791b]';
  return 'bg-pink-soft text-[#c23f6c]';
}

/** Badge dello smart score. Il numero non è l'unico segnale (anche colore + label). */
export function SmartScoreBadge({ score, size = 'sm', className }: SmartScoreBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center rounded-2xl font-bold leading-none',
        toneFor(score),
        size === 'sm' ? 'h-12 w-12 text-lg' : 'h-16 w-16 text-2xl',
        className,
      )}
      aria-label={`Smart score ${score} su 100`}
    >
      <span>{score}</span>
      <span className={cn('font-semibold', size === 'sm' ? 'text-[9px]' : 'text-[10px]')}>
        score
      </span>
    </div>
  );
}
