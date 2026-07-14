'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Navigazione differita di un tick.
 *
 * Quando aggiorniamo uno store (Zustand) e subito dopo navighiamo nello stesso
 * handler, il re-render sincrono della pagina corrente può annullare la
 * transizione del router App Router. Rimandare la push al termine del flush di
 * React rende la navigazione affidabile.
 */
export function useDeferredRouter() {
  const router = useRouter();
  return React.useMemo(
    () => ({
      push: (href: string) => {
        setTimeout(() => router.push(href), 0);
      },
    }),
    [router],
  );
}
