import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Dicitura discreta mostrata quando i dati sono dimostrativi. */
export function DemoDataNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-center gap-2 rounded-2xl bg-blue-soft px-3 py-2 text-xs font-medium text-[#2f6dbd]',
        className,
      )}
    >
      <Info className="h-4 w-4 shrink-0" aria-hidden />
      <span>Dati dimostrativi — prezzi e disponibilità da verificare.</span>
    </div>
  );
}
