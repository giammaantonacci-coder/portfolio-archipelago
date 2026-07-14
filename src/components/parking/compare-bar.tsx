'use client';

import Link from 'next/link';
import { GitCompareArrows, X } from 'lucide-react';
import { useComparisonStore } from '@/store/comparison-store';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Barra fluttuante sopra la bottom nav quando ci sono parcheggi da confrontare. */
export function CompareBar() {
  const ids = useComparisonStore((s) => s.ids);
  const clear = useComparisonStore((s) => s.clear);

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-40 px-4 lg:bottom-6">
      <div className="mx-auto flex max-w-app items-center justify-between gap-3 rounded-2xl bg-text-primary px-4 py-3 text-white shadow-soft-lg">
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-2 text-sm font-medium"
          aria-label="Svuota confronto"
        >
          <X className="h-4 w-4" aria-hidden />
          {ids.length} selezionati
        </button>
        <Link
          href="/compare"
          className={cn(
            buttonVariants({ size: 'sm', variant: 'primary' }),
            'bg-white text-primary hover:bg-white/90',
          )}
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          Confronta
        </Link>
      </div>
    </div>
  );
}
