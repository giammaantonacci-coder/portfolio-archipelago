import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';
import { SearchForm } from '@/components/search/search-form';
import { RecentSearches } from '@/components/search/recent-searches';
import { DemoDataNotice } from '@/components/parking/demo-data-notice';
import { isDemoMode } from '@/lib/config';

export default function HomePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-center justify-between lg:hidden">
        <Logo />
        <Link
          href="/onboarding"
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Come funziona
        </Link>
      </header>

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold leading-tight">Dove devi andare?</h1>
        <p className="text-text-secondary">
          Parcheggiare meglio, ogni giorno. Confrontiamo prezzo, distanza, tempi e comodità per
          consigliarti il parcheggio più adatto.
        </p>
      </section>

      {isDemoMode && <DemoDataNotice />}

      <Card>
        <CardContent>
          <SearchForm />
        </CardContent>
      </Card>

      <RecentSearches />
    </div>
  );
}
