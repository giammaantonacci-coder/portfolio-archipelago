'use client';

import Link from 'next/link';
import { Heart, CircleParking, Trash2 } from 'lucide-react';
import { useFavoritesStore } from '@/store/favorites-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatPrice } from '@/lib/utils';
import { EmptyState, LoadingSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const favorites = useFavoritesStore((s) => s.favorites);
  const remove = useFavoritesStore((s) => s.remove);

  if (!hydrated) return <LoadingSkeleton count={2} />;

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-extrabold">Preferiti</h1>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Ancora nessun preferito"
          description="Salva i parcheggi che usi più spesso per ritrovarli in un tocco."
        />
      ) : (
        <ul className="space-y-3">
          {favorites.map((fav) => (
            <li
              key={fav.id}
              className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-soft text-primary">
                  <CircleParking className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  {fav.parking ? (
                    <Link
                      href={`/parking/${fav.parking.id}`}
                      className="block truncate font-bold text-text-primary"
                    >
                      {fav.label}
                    </Link>
                  ) : (
                    <span className="block truncate font-bold text-text-primary">{fav.label}</span>
                  )}
                  {fav.parking && (
                    <span className="text-xs text-text-secondary">
                      {formatPrice(fav.parking.estimatedTotalPrice)} stimati
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Rimuovi ${fav.label} dai preferiti`}
                onClick={() => remove(fav.id)}
              >
                <Trash2 className="h-5 w-5 text-text-secondary" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
