# EasyFisk

Se [prosjektloggen](PROSJEKTLOGG.md) for daterte milepæler, designvalg og større feilrettinger. Oppdater den ved større endringer, sammen med relevante tekniske notater.

## Veiledning for prototypetestere

I demomodus viser `features/test-guide/` en obligatorisk introduksjon før appen kan brukes.
Fullføring lagres per nettleser under `easyfisk-test-guide-completed`. Endre
`TEST_GUIDE_VERSION` i `guide-version.ts` når eksisterende testere skal se en vesentlig
oppdatert veiledning. Ikke øk versjonen for hver smårettelse. Delvis gjennomgang regnes
ikke som fullført. Ved utilgjengelig lagring kan brukeren fortsatt fullføre for dette besøket.

«Vis meg hvor» åpner Mer og markerer den faktiske statusmotor-knappen uten å aktivere en
testsituasjon eller endre fiskedata. Resten av appen er inaktiv til siste «Test appen».
Veiledningen kan åpnes igjen fra Mer eller PC-panelet. Full tilbakestilling fjerner også
fullføringen; selektiv sletting av fiskedata gjør ikke det. `local`-modus viser ikke testveiledning.

De ordinære nettlesertestene bruker en nettleserprofil som har fullført introduksjonen.
`tests/visual/test-guide.spec.ts` bruker tom profil og kontrollerer introduksjon, oppdatering,
gjenåpning, tastatur, engelsk, liten skjerm og lagringsfeil. Tilbakestilling testes separat.

EasyFisk er en mobiltilpasset prototype for fiske i Mandalselva. Appen samler statuskontroll, sonevalg, fiskeøkter, fangstrapportering, kvoter, historikk, regler og tilbakemeldinger i én oversiktlig brukeropplevelse.

Researchgrunnlaget for en framtidig fiskekortprototype ligger i
[`docs/mandalselva-fishing-permits-2026.md`](docs/mandalselva-fishing-permits-2026.md).

Fiskeøkter, fangster og valgte profilinnstillinger lagres lokalt i nettleseren. Fangstbilder og
dokumentvedlegg lagres separat i IndexedDB, slik at de ikke fyller localStorage. Hele
økthistorikken, inkludert fangstbilder, overlever oppdatering av siden.

Dette er fortsatt en prototype. Betaling, fiskekortkontroll, varsler og innsending til elveeigarlaget er fortsatt
demonstrasjonsdata eller lokale handlinger. Kartets posisjonsforespørsel bruker faktisk GPS når brukeren gir tilgang.

## Fiskekort og testkjøp

Fiskekortbutikken bruker et kontrollert øyeblikksbilde av offentlig produktinformasjon, kontrollert 31. august 2026. Produktene, prisene og kapasiteten er ikke sanntidsdata. Tilgjengelighet,
reservasjon og betaling er simulert, og ingen penger trekkes.

En godkjent testbetaling oppretter et lokalt, tydelig merket testkort i nettleserens IndexedDB.
Kortet vises under «Mine fiskekort», påvirker normal statuskontroll og begrenser sonevalget så lenge
testdatoen er gyldig. Avbrutt eller feilet testbetaling lagrer ingenting. Testkjøpte kort kan fjernes
med «Nullstill testkjøpte fiskekort» i fiskekortbutikken.

Kildegrunnlag, kontrolltidspunkt og kjente begrensninger er dokumentert i
[`docs/mandalselva-fishing-permits-2026.md`](docs/mandalselva-fishing-permits-2026.md).

## Kom i gang

Krav: Node.js 22.13 eller nyere.

```bash
npm ci
npm run dev
```

Åpne deretter `http://localhost:3000`.

## Kvalitetskontroll

Kjør hele kontrollpakken før en endring slås sammen:

```bash
npm run check
```

Kontrollpakken kjører formateringssjekk, linting, TypeScript, tester og produksjonsbygg. Delkontroller kan også kjøres separat:

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm run test:visual
```

Nettlesertestene dekker de viktigste brukerflytene, tilgjengelig samhandling på mobil og visuelle
referansebilder for dokumenterte skjermbredder. Se
[`docs/fishing-permit-prototype-testing.md`](docs/fishing-permit-prototype-testing.md) for testmatrisen
til fiskekortprototypen.

## Teknologi

- Next.js med App Router
- React
- TypeScript i streng modus
- Node-tester for domenelogikk og Vitest/Testing Library for React-flyter
- Vanlig CSS med sentrale design- og fargetokens
- Statisk eksport til GitHub Pages

Prosjektet bruker foreløpig ingen database eller server-API. Fremtidige integrasjoner skal legges bak tydelige grensesnitt, slik at visningskomponenter ikke blir avhengige av en bestemt database eller leverandør.

## Prosjektstruktur

```text
app/                Next.js-ruter og nåværende prototype
components/         Felles layout- og UI-komponenter
features/           Skjermbilder og brukerrettede arbeidsflyter
domain/             Fagtyper og forretningsregler, delt etter fagområde
domain/fishing-rules/ Versjonert regelgrunnlag og kontrollfunksjoner
data/contracts/     Grensesnitt mot datakilder
data/local-storage/ Versjonert prototypelagring i nettleseren
data/memory/        Midlertidig lagring av økter og fangster
data/mock/          Typet demonstrasjonsinnhold og lokale adaptere
data/repositories/  Valg av aktiv dataadapter
hooks/              Gjenbrukbar React-logikk
lib/                Små, generelle hjelpefunksjoner
styles/             Globale stilark
public/             Statiske filer
tests/              Automatiske tester
visual-baseline/    Skjermbilder og krav som bevarer dagens utseende
docs/               Arkitektur og utviklingsregler
```

Den detaljerte ansvarsdelingen og reglene for videre utvidelser er dokumentert i [docs/architecture.md](docs/architecture.md). Kilder, kontrolltidspunkt og aktive 2026-regler er dokumentert i [docs/mandalselva-rules-2026.md](docs/mandalselva-rules-2026.md).

## Språk og navn

- Kode, filnavn, funksjoner, variabler og typer skrives på engelsk.
- Brukergrensesnitt, dokumentasjon og forklarende kommentarer skrives på norsk bokmål.
- Produktnavnet skrives alltid `EasyFisk`.
- Kommentarer skal forklare hvorfor noe er gjort, ikke gjenta hva koden gjør.

Se [CONTRIBUTING.md](CONTRIBUTING.md) for komplette regler.

## Visuell referanse

[visual-baseline/README.md](visual-baseline/README.md) beskriver skjermene, arbeidsflytene og visningsstørrelsene som skal bevares under ombyggingen. Struktur og implementasjon kan endres, men visuelle endringer skal være bevisste og dokumenterte.

## Publisering

Workflowen i `.github/workflows/deploy-pages.yml` bygger en statisk eksport og publiserer den til GitHub Pages når kode sendes til `main`.

I GitHub skal **Settings → Pages → Source** være satt til **GitHub Actions**.

Publisert app:

<https://mariehesseberg.github.io/EasyFisk/>

## Fundament for videreutvikling

Se [arbeidspakke 1–3](docs/development-foundation.md) for tjenestevalg, asynkrone datagrensesnitt, demo/lokal modus og avgrensninger. Kjør `npm run check:all` for både kodekontroll og nettlesertester før endringer deles.

Se også [arbeidspakke 4–5](docs/data-and-time-foundation.md) for dataversjoner, ID-er, bakoverkompatibilitet og norsk tidsbehandling.
