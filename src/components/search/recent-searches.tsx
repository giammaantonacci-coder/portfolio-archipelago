'use client';

import { History } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';
import { getPriorityMeta } from '@/lib/priorities';
import { useDeferredRouter } from '@/hooks/use-deferred-router';

export function RecentSearches() {
  const router = useDeferredRouter();
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const setPreferences = useSearchStore((s) => s.setPreferences);

  if (recentSearches.length === 0) return null;

  return (
    <section aria-label="Ricerche recenti" className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
        <History className="h-4 w-4" aria-hidden />
        Ricerche recenti
      </h2>
      <ul className="space-y-2">
        {recentSearches.map((s, i) => {
          const meta = getPriorityMeta(s.priority);
          return (
            <li key={`${s.destination}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setPreferences(s);
                  router.push('/results');
                }}
                className="touch-target flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-background"
              >
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {s.destination}
                  </span>
                  <span className="block text-xs text-text-secondary">
                    {s.arrivalDate} · {s.arrivalTime}
                  </span>
                </span>
                <span className="text-xs font-medium text-primary">{meta.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
