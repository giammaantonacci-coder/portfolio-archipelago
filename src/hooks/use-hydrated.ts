'use client';

import * as React from 'react';

/** true dopo il primo render lato client: evita mismatch con stati persistiti. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
