import { MobileBottomNavigation } from './mobile-bottom-navigation';
import { DesktopNavigation } from './desktop-navigation';
import { SiteFooter } from './site-footer';

/** Guscio applicativo: navbar desktop, contenuto centrato, bottom nav mobile. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DesktopNavigation />
      <main className="mx-auto w-full max-w-app flex-1 px-4 pb-28 pt-4 lg:max-w-content lg:px-6 lg:pb-16 lg:pt-8">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNavigation />
    </div>
  );
}
