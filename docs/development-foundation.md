# Arbeidspakke 1–3: fundament for videreutvikling

Arbeidet bevarer eksisterende skjermbilder og lokal prototypelagring. Det innfører ikke innlogging, en produksjonsdatabase eller reelle betalinger. Datamodeller og tidssoneberegninger er fulgt opp i [arbeidspakke 4–5](data-and-time-foundation.md).

## Ett sted for valg av tjenester

`data/runtime/services.ts` oppretter `AppServices`. Her velges fiskelogg, bilder, fiskekortkatalog, kjøpslagring, rapporteringsdøgn, dokumenter, profil, regelgodkjenninger, innstillinger, klokke og innebygd visningsinnhold. De eksisterende eksportene i `data/repositories/` peker til dette oppsettet.

Komponenter og kontrollere bruker `useAppServices()`. `AppServicesProvider` gjør det mulig å erstatte tjenester i en avgrenset app/test uten å endre skjermkomponentene. `createAppServices(overrides)` bevarer standardadapterne for tjenestene som ikke erstattes.

Det utskiftbare datalaget mot skjermene er asynkront. Lokale lageradaptere kan fortsatt ha synkrone metoder; `AsyncRepository` og `asAsyncRepository` gir dem et asynkront grensesnitt. Adapteren skjuler ikke feil som tomme svar. En framtidig HTTP-adapter implementerer samme appgrensesnitt og må fortsatt validere svar og håndtere nettfeil.

Dokumentgrensesnittet inkluderer `saveMany`: samlet utstedelse skal ikke omgå adapteren ved å kalle en IndexedDB-funksjon fra skjermen. Kjøpskontrolleren henter tilgjengelighetsgrunnlaget gjennom den valgte kjøpslagringen.

## Forsinkelser, feil og gjentatte handlinger

- Katalog, kjøp, dokumenter og rapporteringsdøgn skiller lasting og lesefeil fra et tomt resultat.
- Felles spørringshook ignorerer svar fra eldre forespørsler og avmonterte komponenter.
- Fiskestart, avslutning, korrigering og kjøp venter på lagringssvaret før lokal bekreftelse.
- Fiskestart og kjøpsinnsending har lås før asynkront arbeid. Dette beskytter mot raske gjentatte trykk i samme appinstans; det erstatter ikke framtidig idempotenskontroll på serveren.
- Hovedskjermen er ikke interaktiv før innledende dokument- og fiskelogglesing er ferdig. Ved lesefeil vises en feil med mulighet for ny innlasting.
- Ugyldig fiskelogglagring avvises. Den behandles ikke som en tom logg som kan overskrives ved neste lagring.
- Bilder som ble lagret før en mislykket fangstskriving ryddes opp også når en adapter avviser et asynkront kall.

## Demo og lokal utvikling

Kopier `.env.example` til `.env.local` om du trenger å velge modus. Start utviklingsserveren på nytt etter endringen.

| Modus   | Oppførsel                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `demo`  | Standard. Beholder prototypens testklokke, testpanel og simulerte betaling.                                                       |
| `local` | Virkelig klokke, uten testpanelet og uten utstedelse gjennom simulert betaling. Fortsatt lokal lagring og eksempelbasert katalog. |

`local` betyr ikke produksjon. Ukjente verdier, også `production`, avvises fordi virkelige tjenester ennå ikke er konfigurert. `NEXT_PUBLIC_`-variabler er offentlig klientkonfigurasjon og må aldri inneholde hemmeligheter. Denne modusbryteren er ikke en sikkerhetsgrense for ekte rettigheter.

Selve testklokken ligger i `data/prototype/demo-clock.ts`. Domenets klokke er uavhengig av nettleserlagring og bruker systemtid dersom ingen annen klokke velges. Appens oppsett velger riktig klokke; Vitest velger demooppsettet eksplisitt. Domenet beholder regelversjonenes metadata, mens lokal lagring av godkjenninger ligger i datalaget.

## Kontroll og testgrunnlag

```sh
npm ci
npx playwright install chromium
npm run check:all
```

`npm run check` kjører formatering, lint, typer, enhetstester og bygg. `npm run test:visual` kjører nettleserflyter og eksisterende skjermbildesammenligninger. `check:all` kjører begge. Både PR-kontroll og publisering til Pages inkluderer nå nettlesertestene.

Testene for hjemskjermen og brukerflytene følger det allerede godkjente designet, regelgodkjenning per versjon og det samlede fangstskjemaet. Referansebilder skal ikke oppdateres bare for å få grønne tester.

`tests/async-services.test.tsx` undersøker forsinket lagring, avviste svar, foreldede svar, gjenåpning av økt og gjentatte kjøp. Arkitekturtestene beskytter skillet mellom domeneregler og nettleserlagring og mellom skjermkode og konkrete lagringsadaptere.

## Avgrensninger som fortsatt gjelder

- Profilforhåndsutfylling og regelaksept bruker fortsatt et synkront lokalt grensesnitt gjennom det sentrale oppsettet. Dette er ikke en verifisert konto eller serverbekreftet regelaksept.
- Utkast, språkvalg, lesestatus og gjenopptakelse av kjøpsskjermen er fortsatt lokal visningstilstand. En eventuell synkronisering av disse krever et eget behov og design.
- Regel-, sone- og visningsinnhold er innebygd konfigurasjon. Det er ikke etablert en tjeneste for publisering av regler eller stenging.
- Faktisk innsendte rapporter, lagerreservasjon, betaling, autorisering og lagring på tvers av telefoner er ikke implementert. Ikke koble ekte betaling direkte til dagens klientbaserte utstedelse.
- Nettleserkontrollen bruker fortsatt Chromium. WebKit, fysiske telefoner og appbutikkdistribusjon hører til den videre mobilpakken.

Datamodeller og tidsbehandling er videreført i arbeidspakke 4–5. Ta små endringer med eksisterende tester og behold fungerende migrering fra prototypedata.
