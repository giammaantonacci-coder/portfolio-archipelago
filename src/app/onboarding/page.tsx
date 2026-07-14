import Link from 'next/link';
import { MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

const STEPS = [
  {
    icon: MapPin,
    title: 'Dicci dove devi andare',
    text: 'Inserisci destinazione, giorno, orario e durata della sosta.',
  },
  {
    icon: Sparkles,
    title: 'Scegli la tua priorità',
    text: 'Più conveniente, più vicino, miglior compromesso o zero stress.',
  },
  {
    icon: ShieldCheck,
    title: 'Parcheggia con un piano',
    text: 'Confronta le opzioni, salva un piano A e un piano B.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <Logo />
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold leading-tight">Parcheggiare meglio, ogni giorno.</h1>
        <p className="text-text-secondary">
          Dimmi dove devi andare. Parqo ti dice dove conviene lasciare l’auto.
        </p>
      </section>

      <ol className="space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title}>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-secondary">Passo {i + 1}</p>
                    <h2 className="font-bold">{s.title}</h2>
                    <p className="text-sm text-text-secondary">{s.text}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <Link href="/" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
        Inizia ora
      </Link>

      <p className="text-center text-xs text-text-secondary">
        Le informazioni hanno finalità indicative. Verifica sempre segnaletica, tariffe, accessi e
        disponibilità sul posto.
      </p>
    </div>
  );
}
