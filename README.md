# Parqo

**Parcheggiare meglio, ogni giorno.**

Parqo è un assistente decisionale per il parcheggio. Non è una mappa di parcheggi né
un elenco di autorimesse: dimmi dove devi andare e Parqo ti dice **dove conviene lasciare
l'auto**, confrontando prezzo, distanza, tempi e comodità e spiegando **perché** consiglia
una scelta.

> Le informazioni hanno finalità indicative. Verifica sempre segnaletica, tariffe, accessi
> e disponibilità sul posto.

---

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** con design token; primitive UI accessibili in stile shadcn/ui
- **Lucide Icons**
- **Zod** + **React Hook Form** (validazione form)
- **TanStack Query** (dati asincroni) · **Zustand** (solo stato UI globale)
- **Supabase** (database + auth, opzionale)
- **Mapbox** dietro un adapter (opzionale)
- **Vitest** + **Testing Library** (unit) · **Playwright** (e2e)
- **ESLint** + **Prettier** · **PWA** (manifest + service worker)
- Package manager: **pnpm**

## Requisiti

- Node.js ≥ 20
- pnpm ≥ 9

## Installazione e avvio

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

L'app funziona **subito, in modalità demo**, senza alcuna credenziale esterna.

## Comandi

```bash
pnpm dev          # sviluppo
pnpm build        # build di produzione
pnpm start        # avvio build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript --noEmit
pnpm test         # unit test (Vitest)
pnpm test:e2e     # end-to-end (Playwright)
pnpm format       # Prettier
```

> In ambienti con un Chromium già installato, esegui gli e2e con
> `PLAYWRIGHT_CHROMIUM_PATH=/percorso/al/chromium pnpm test:e2e`.
> Altrimenti installa i browser con `pnpm exec playwright install chromium`.

## Variabili d'ambiente

Copia `.env.example` in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_DEMO_MODE=true
```

- Se `NEXT_PUBLIC_DEMO_MODE=true` **oppure** mancano le variabili Supabase/Mapbox,
  Parqo usa automaticamente i **provider demo**.
- Non inserire mai la **service role key** di Supabase nel client.

## Modalità demo

Senza token Mapbox, senza progetto Supabase e senza account l'app resta pienamente
navigabile:

- coordinate, parcheggi, prezzi, tempi e distanze **sintetici** e coerenti;
- mappa rappresentata da un **placeholder elegante**;
- piani e preferiti salvati in **localStorage**.

Ogni dato demo è marcato nel codice con `isDemo: true` e in interfaccia con la dicitura
_"Dati dimostrativi — prezzi e disponibilità da verificare."_ Nessun nome di struttura
reale viene usato con prezzi inventati.

## Struttura delle cartelle

```
src/
  app/                    # rotte App Router (/, /results, /parking/[id], /compare,
                          #   /route-plan, /plans, /favorites, /profile, /onboarding)
  components/
    layout/               # AppShell, navigazione mobile/desktop, footer, logo
    search/               # SearchForm, PrioritySelector, RecentSearches
    parking/              # ParkingCard, filtri, ordinamento, pro/contro, breakdown, confronto
    route/                # RouteSummary, RouteMap
    plans/                # PlanCard
    states/               # EmptyState, ErrorState, LoadingSkeleton
    ui/                   # primitive accessibili (button, card, input, sheet, ...)
  hooks/                  # useSearchResults, useScoredGroup, useHydrated, useDeferredRouter
  lib/
    scoring/              # scoring engine puro + compatibilità + pro/contro (testati)
    providers/            # ParkingProvider / MapProvider + impl. demo/supabase/mapbox
    demo/                 # destinazione + 12 parcheggi sintetici
    filters.ts            # filtri e ordinamenti
    search-service.ts     # orchestrazione provider + scoring
    validation.ts         # schema Zod
    analytics.ts          # adapter analytics
  store/                  # Zustand: search, comparison, plans, favorites, profile, plan-draft
  types/                  # modello di dominio
public/                   # manifest PWA, service worker, icone, offline.html
supabase/                 # migration SQL (+ RLS) e seed demo
e2e/                      # test Playwright
legacy/                   # sito portfolio precedente (preservato)
```

## Scoring engine

Il punteggio (0–100) è calcolato da una funzione **pura e testabile**
(`src/lib/scoring/calculate-parking-score.ts`), separata dalla UI. I valori sono
normalizzati rispetto al gruppo di parcheggi della ricerca su sei dimensioni — costo,
distanza a piedi, tempo totale, comodità, rischio, affidabilità dei dati — con **pesi
diversi per ciascuna priorità** (Più conveniente, Più vicino, Miglior compromesso, Zero
stress). Le opzioni incompatibili (altezza veicolo, accessibilità, EV richiesta, orario
insufficiente) sono penalizzate e **non vengono mai proposte come consigliate**.

Pro e contro e la spiegazione sintetica sono generati con **regole deterministiche**
(nessun LLM).

## Configurazione Supabase (opzionale)

1. Crea un progetto Supabase e copia URL + anon key in `.env.local`.
2. Applica lo schema:
   ```bash
   supabase db push        # oppure esegui supabase/migrations/0001_init.sql
   psql "$DATABASE_URL" -f supabase/seed.sql   # seed demo (facoltativo)
   ```
3. Lo schema include **Row Level Security** e policy: i parcheggi sono in lettura
   pubblica (le ricerche funzionano senza login), mentre profilo, veicoli, preferiti,
   ricerche salvate e piani sono accessibili solo al proprietario.
4. L'autenticazione (magic link) serve **solo** a sincronizzare dati e piani tra
   dispositivi: non è mai obbligatoria per cercare un parcheggio.

## Configurazione Mapbox (opzionale)

Imposta `NEXT_PUBLIC_MAPBOX_TOKEN`. Tutta la logica passa dall'adapter `MapProvider`:
la business logic non dipende direttamente dal provider. Per la navigazione effettiva
Parqo genera **deep link** verso Google Maps e Apple Maps (nessun turn-by-turn
proprietario).

## Limiti attuali dell'MVP

- Nessuna disponibilità **live** degli stalli, nessuna prenotazione o pagamento.
- I dati demo sono sintetici; l'integrazione con fornitori reali è solo predisposta
  (`ExternalParkingProvider` è uno scheletro non attivo, nessuno scraping).
- La mappa in demo è un placeholder; con Mapbox configurato l'adapter fornisce
  geocoding e routing reali, ma il rendering mappa interattivo resta un passo successivo.
- La sincronizzazione cloud richiede la configurazione di Supabase.

## Roadmap

- Rendering mappa interattivo con Mapbox GL e percorsi reali in-app.
- Integrazione di fornitori dati reali dietro `ParkingProvider`.
- Sincronizzazione completa piani/preferiti con Supabase e magic link.
- Affinamento dei pesi dello scoring sulla base del comportamento reale.
- Notifiche pro-memoria per i piani programmati.

## Non-obiettivi

Pagamenti strisce blu, prenotazioni proprietarie, disponibilità live, marketplace di
posti privati, IoT/OCR/lettura targhe, gestione multe, social/chat, dashboard aziendali,
flotte, abbonamenti, app native.
