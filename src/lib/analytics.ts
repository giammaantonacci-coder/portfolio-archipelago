/**
 * Adapter analytics indipendente dal provider.
 * In modalità demo/dev stampa gli eventi in console. In produzione con un
 * provider reale è sufficiente sostituire l'implementazione di `track`.
 */

export type AnalyticsEvent =
  | 'search_started'
  | 'search_completed'
  | 'priority_selected'
  | 'parking_opened'
  | 'parking_compared'
  | 'parking_selected'
  | 'route_started'
  | 'plan_saved'
  | 'backup_selected'
  | 'favorite_added'
  | 'filter_applied'
  | 'no_results';

export interface Analytics {
  track(event: AnalyticsEvent, props?: Record<string, unknown>): void;
}

class ConsoleAnalytics implements Analytics {
  track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[analytics] ${event}`, props ?? {});
    }
  }
}

export const analytics: Analytics = new ConsoleAnalytics();
