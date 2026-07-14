# Parqo

**Parcheggiare meglio, ogni giorno.**

Parqo è un assistente decisionale per il parcheggio. Non è una mappa di parcheggi né
un elenco di autorimesse: dimmi dove devi andare e Parqo ti dice **dove conviene lasciare
l'auto**, confrontando prezzo, distanza, tempi e comodità e spiegando **perché** consiglia
una scelta.

**Funziona con dati reali senza alcuna chiave**: geocoding via Nominatim, parcheggi
reali da OpenStreetMap (Overpass) e mappa interattiva MapLibre + tile OSM. Le tariffe
non presenti in OSM restano marcate come "da verificare" — nessun prezzo inventato.

> Le informazioni hanno finalità indicative. Verifica sempre segnaletica, tariffe, accessi
> e disponibilità sul posto.

---

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** con design token; primitive UI accessibili in stile shadcn/ui
- **Lucide Icons**
- **OpenStreetMap**: Nominatim (geocoding) + Overpass (parcheggi) — dati reali, nessuna chiave
- **MapLibre GL** + tile OSM per la mappa interattiva (Mapbox opzionale dietro adapter)
- **Zod** + **React Hook Form** (validazione form)
- **TanStack Query** (dati asincroni) · **Zustand** (solo stato UI globale)
- **Supabase** (auth magic link + sync cloud, opzionale)
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

L'app funziona **subito con dati reali** (OpenStreetMap), senza alcuna credenziale.
Serve solo l'accesso di rete a `nominatim.openstreetmap.org`, `overpass-api.de` e
`tile.openstreetmap.org` (raggiungibili da qualsiasi deployment con internet).

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
NEXT_PUBLIC_PARKING_SOURCE=osm        # osm (default, reale) | supabase | demo
NEXT_PUBLIC_DEMO_MODE=false           # true = dati sintetici offline
NEXT_PUBLIC_SUPABASE_URL=             # opzionale: auth + sync cloud
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=             # opzionale: mappa/routing di qualità
```

Selezione automatica dei provider:

| Serve…          | Default (nessuna chiave)              | Con configurazione                   |
| --------------- | ------------------------------------- | ------------------------------------ |
| Parcheggi       | OpenStreetMap (Overpass)              | Supabase (`PARKING_SOURCE=supabase`) |
| Geocoding/mappa | Nominatim + MapLibre + tile OSM       | Mapbox (se `MAPBOX_TOKEN` presente)  |
| Auth & sync     | localStorage (nessun login richiesto) | Supabase magic link                  |

- Non inserire mai la **service role key** di Supabase nel client.
- `NEXT_PUBLIC_DEMO_MODE=true` forza i dati sintetici offline (utile per sviluppo
  senza rete e per i test e2e).

## Modalità demo (offline)

Con `NEXT_PUBLIC_DEMO_MODE=true` l'app usa 12 parcheggi sintetici, una mappa
placeholder e `localStorage`, senza alcuna rete. Ogni dato demo è marcato con
`isDemo: true` e con la dicitura _"Dati dimostrativi — prezzi e disponibilità da
verificare."_ Nessun nome di struttura reale viene usato con prezzi inventati.

## Dati reali (OpenStreetMap)

Con la configurazione predefinita:

- la destinazione viene geocodificata via **Nominatim** (route server `/api/geocode`);
- i parcheggi reali attorno alla destinazione arrivano da **Overpass/OSM**
  (route server `/api/parkings`), con distanze e tempi derivati dalle coordinate reali;
- le **tariffe assenti** in OSM restano marcate `hasKnownPrice: false` → mostrate come
  _"Da verificare"_ e trattate come neutre nello scoring (mai spacciate per il prezzo reale).

Le chiamate esterne passano da route handler server-side (User-Agent corretto per
Nominatim, caching); il client parla solo con la stessa origine.

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
    providers/            # ParkingProvider / MapProvider: demo, osm, supabase, nominatim, mapbox
    osm/                  # parser Overpass → Parking (puro, testato)
    supabase/             # client browser/server + sync cloud
    geo.ts                # haversine + polilinea
    demo/                 # destinazione + 12 parcheggi sintetici (offline)
    filters.ts            # filtri e ordinamenti
    search-service.ts     # geocoding + provider + scoring
    validation.ts         # schema Zod
    analytics.ts          # adapter analytics
  app/api/                # route server: /geocode (Nominatim), /parkings (Overpass)
  app/auth/callback/      # callback magic link Supabase
  components/auth/        # AuthProvider, AuthSyncCard
  middleware.ts           # refresh sessione Supabase (inerte senza config)
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

## Autenticazione & sync cloud (Supabase, opzionale)

L'app funziona senza login. Configurando Supabase si attivano **magic link** e la
**sincronizzazione** di piani, preferiti e profilo tra dispositivi:

1. Crea un progetto Supabase e copia URL + anon key in `.env.local`.
2. Applica lo schema e (facoltativo) il seed dei parcheggi Supabase:
   ```bash
   supabase db push        # oppure esegui supabase/migrations/0001_init.sql
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
3. In **Auth → URL Configuration** aggiungi `${APP_URL}/auth/callback` tra i redirect.
4. Lo schema include **Row Level Security**: i parcheggi (tabella opzionale) sono in
   lettura pubblica, mentre profilo, veicoli, preferiti e piani sono accessibili solo al
   proprietario. Piani e preferiti sono salvati come snapshot `jsonb`, così da funzionare
   anche con parcheggi da fonti esterne (OSM).

Il flusso: `AuthProvider` gestisce la sessione, `middleware.ts` ne fa il refresh,
`/auth/callback` completa il magic link e `CloudSync` fonde i dati remoti al login e
rispecchia le modifiche locali (best-effort, senza mai bloccare l'uso locale).

## Mappa e navigazione

- Senza chiavi: **MapLibre GL** con tile OpenStreetMap.
- Con `NEXT_PUBLIC_MAPBOX_TOKEN`: stile Mapbox (l'adapter `MapProvider` isola il provider).
- Per la navigazione reale Parqo genera **deep link** verso Google Maps e Apple Maps
  (nessun turn-by-turn proprietario).

## Limiti attuali dell'MVP

- Nessuna disponibilità **live** degli stalli, nessuna prenotazione o pagamento.
- I dati OSM sono di qualità variabile: tariffe, orari e altezze non sempre presenti
  vengono mostrati come "da verificare" (mai inventati). La ZTL non è desumibile da OSM:
  vale il disclaimer di verifica sul posto.
- Il routing dei tempi in modalità senza-Mapbox è stimato dalle coordinate reali
  (distanza geodetica), non un percorso stradale completo.
- La sincronizzazione cloud richiede la configurazione di Supabase.

## Roadmap

- Routing stradale reale in-app (OSRM/Mapbox Directions) per tempi porta-a-porta.
- Overlay ZTL da dataset comunali dove disponibili.
- Integrazione di fornitori dati commerciali dietro `ParkingProvider`.
- Prezzi verificati e disponibilità dove i dati lo consentono.
- Affinamento dei pesi dello scoring sulla base del comportamento reale.
- Notifiche pro-memoria per i piani programmati.

## Non-obiettivi

Pagamenti strisce blu, prenotazioni proprietarie, disponibilità live, marketplace di
posti privati, IoT/OCR/lettura targhe, gestione multe, social/chat, dashboard aziendali,
flotte, abbonamenti, app native.
