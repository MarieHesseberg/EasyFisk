# EasyFisk: fra prototype til mobilapp

Gjennomgang 19. september 2026 av arbeidskopien på `main`, commit `8035c5d`. Dette er en teknisk vurdering og et forslag til videre arbeid, ikke en godkjenning for produksjon. Ingen funksjoner eller design er endret som del av gjennomgangen.

## Konklusjon

Koden er et brukbart utgangspunkt for både iPhone og Android. Det er ikke nødvendig å starte på nytt eller lage to separate apper nå. Men dagens løsning er en mobiltilpasset nettprototype, ikke en ferdig tjeneste for ekte kjøp, personlige kontoer og innsendte rapporter.

Det viktigste arbeidet er felles for begge plattformer: pålitelig lagring, identitet, betaling, regeldata, feilbehandling og testing. Å pakke dagens kode som en nedlastbar app løser ikke disse manglene.

Gjennomgangen omfatter arkitektur, sentrale kjøps- og rapporteringsflyter, lagringslag, navigasjon, regelversjoner, mobilstiler, kart/GPS, byggoppsett og automatiserte kontroller. Den er ikke en full sikkerhetsrevisjon, kontroll av fiskereglenes riktighet eller fysisk testing av alle telefoner.

## Det som allerede er et godt grunnlag

- React, Next.js og TypeScript med streng typesjekking er egnet for videreutvikling av en felles mobilnettløsning.
- Koden er delt i funksjonsområder, applikasjonslogikk, domeneregler og datalagring. Repository-grensesnitt gjør det mulig å innføre en server gradvis.
- Det finnes enhetstester, nettlesertester, utviklerdokumentasjon og automatisert bygging.
- Mobilstiler har blant annet berøringsmål, fokusmarkering, rulling og tilpasning til skjermstørrelse.
- Kartets posisjonsforespørsel håndterer flere feiltilstander. Kart/GPS trenger ikke bygges om for å begynne oppryddingen.
- Regelversjoner har fått et mønster for historiske øyeblikksbilder. Det er et godt utgangspunkt, selv om akseptene fortsatt bare lagres lokalt.

## Funn som må håndteres før vanlig bruk

### 1. Skill testmiljø og virkelig drift

`domain/shared/app-clock.ts` starter tiden på 20. august 2026. Dette er den delte appklokken, ikke bare en klokke som slås på sammen med synlig testmodus. Det påvirker datoavhengig logikk og registreringstidspunkt.

Katalogen leveres fra `data/prototype`, annet innhold fra mock-repositories, og testbetaling velges i navigasjons-/kjøpskontrollerne. Disse løsningene er nyttige i demonstrasjoner, men må ikke kunne brukes som grunnlag for virkelige rettigheter.

**Tiltak:** egne, tydelige miljøer for demo, test og produksjon; injiserbar klokke i tester; virkelig tid i drift; serveren avgjør transaksjonstid og gyldighet. Produksjonsbygg skal ikke kunne overstyre betalingsresultater eller dokumentstatus gjennom testpanelet.

### 2. Innfør kontoer og felles lagring

`data/repositories/fishing-log.ts`, `preferences.ts` og flere funksjonsområder bruker lokal nettleserlagring. Dokumenter, bilder, utkast og tilbakemeldinger benytter også IndexedDB. Det finnes ikke en felles server som gjør opplysningene tilgjengelige på en annen telefon.

Profilens e-postadresse er lokalt redigerbar. Det er ikke innlogging eller sikker identifikasjon. Grunneierkort og tilgangstildeling i prototypen kan derfor ikke brukes som verifiserte rettigheter. Tilbakemeldinger lagret i `data/repositories/feedback.ts` er ikke dermed levert til elveeierlaget.

**Tiltak:** backend med autentisering, database og filoppbevaring. Serverkontrollert tilgang for fisker, grunneier, oppsyn og administrator. Mottaker, gyldighet, område og tilbakekalling må følge hver tilgangstildeling. Rapporter trenger serverkvittering og synlig leveringsstatus. Test at én bruker ikke kan lese eller endre en annens data.

Lokal lagring skal være hurtigbuffer/arbeidskopi, ikke eneste oppbevaring av kjøpte fiskekort. Nettleserdata kan slettes eller fjernes ved lagringspress; heller ikke varig lagring erstatter sikkerhetskopi. Se [WebKits lagringsmodell](https://webkit.org/blog/14403/updates-to-storage-policy/).

### 3. Etabler ekte kjøp og verifiserbare fiskekort

`features/fishing-permits/permit-vipps-payment.tsx` simulerer betaling. Kjøpskontrolleren lager testordre og dokumenter lokalt. Katalog/priser/tilgjengelighet er ikke et levende, felles varelager.

**Tiltak:** avklar først om EasyFisk selv skal selge, integreres med selger eller åpne selgerens betalingsside. Ved eget kjøp må serveren kontrollere pris, tilgjengelighet og tillatelser, reservere kapasitet og utstede kort først etter verifisert betalingsresultat. Håndter dobbelttrykk, avbrutt nett, ventende betaling, refusjon og gjentatte betalingsmeldinger uten dobbeltkjøp. [Vipps dokumenterer servervarsler for ePayment](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/webhooks/).

Kortkapasitet og personlig fangstkvote må fortsatt være separate begreper. Kortet må kunne kontrolleres av oppsyn mot en autoritativ registrering.

### 4. Gjør regel- og statusinformasjonen etterprøvbar

`domain/fishing-rules/mandalselva-2026.ts` peker på et versjonert regelsett. `rule-acceptance.ts` knytter lokal godkjenning til profilens e-post og appklokken. Varselbjellen bygger på innebygd innhold og lokalt lagret lesestatus; dette er ikke en tjeneste for varsler til telefonen.

**Tiltak:** behold historiske regelsett uendret, og lagre publiserings-/gyldighetstid, sone og hvem som publiserte. Lagre aksept per verifisert bruker og regelversjon på serveren. Definer hvordan regelendringer og stenging når brukerne, og hva statusmotoren sier når informasjonen er gammel eller ikke kan bekreftes. «Klar til å fiske» må ha en tydelig, avtalt betydning.

Lokale regler, datoer og innleveringsveiledning må bekreftes av ansvarlig forvalter. Datoene 1. mars og 15. september skal ikke innføres som nye regler uten avklaring. Eksisterende spørsmål i `docs/stakeholder-clarification-questions.md` er nyttige, men enkelte beskrivelser der må oppdateres etter nyere endringer.

### 5. Planlegg for dårlig dekning og avbrudd

Det er ikke funnet manifest eller service worker i appen. Lokal lagring alene gjør ikke siden tilgjengelig når den åpnes uten nett.

**Tiltak:** definer hva som skal fungere uten dekning: vise tidligere nedlastede fiskekort og regler, bevare utkast og eventuelt registrere fangst for senere levering. Vis «lagret på telefonen» separat fra «mottatt». Synkronisering må tåle gjentakelser og konflikter. Ikke godkjenn betaling eller lov nytt kortsalg bare på grunnlag av lokal informasjon.

Test tvungen lukking, bakgrunn/forgrunn, tomt batteri, tidsendringer, lagringsfeil og overgang mellom nett og frakoblet tilstand. Sletting og tilbakestilling må få tydelig omfang: utkast, lokale data og serverdata er forskjellige ting; en betalt ordre skal ikke forsvinne ved å nullstille skjermen.

### 6. Gjør navigasjon og mobilbruk robust

`application/easy-fisk/use-app-navigation-controller.ts` holder skjermvalg i React-tilstand. Det gir ikke i seg selv vanlige adresser, dyplenker eller nettleserhistorikk per side. Oppfriskning og Androids tilbakeknapp trenger definerte oppførsler.

**Tiltak:** innfør ordentlig ruting/historikk og beskytt ulagrede utkast. Kontroller skjermtastatur, små skjermer, liggende telefon, stor tekst, skjermutsparinger og rulling i dialoger. Kontroller viewport/safe-area samlet; CSS med safe-area er ikke alene en test av iPhone-layout.

Test VoiceOver på iPhone og TalkBack på Android, fokusrekkefølge, kontrast, feilmeldinger, 200 % tekst og at informasjon ikke uttrykkes bare med farge. Eksisterende CSS inneholder også små tekststørrelser som må vurderes. Universell utforming kan ikke bekreftes ut fra skjermbilder alene.

Kartet kan beholdes. Avklar produksjonsbruk og tjenestenivå for kartflisene fra NRKs kartcache før lansering. Frakoblet kart krever separat vurdering av teknikk og bruksrettigheter. GPS bør være frivillig der manuelt sonevalg er tilstrekkelig.

## iPhone og Android: anbefalt retning

Next.js 16 oppgir blant annet Safari 16.4+, Chrome 111+, Edge 111+ og Firefox 111+ som nettlesergrunnlag. Det tilsier støtte for moderne telefoner, ikke alle gamle telefoner og nettlesere. Appens egne funksjoner må fortsatt testes. Se [Next.js sine støttede nettlesere](https://nextjs.org/docs/architecture/supported-browsers).

| Alternativ                                | Hva det gir                                                                     | Min vurdering                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Mobilnett/PWA                             | Én nettkodebase, åpnes fra lenke og kan tilpasses installasjon på hjemskjermen  | Beste første steg for pilot og videreutvikling                              |
| Capacitor rundt samme app                 | iOS-/Android-prosjekter, appbutikkdistribusjon og tilgang til native funksjoner | Vurder når butikkdistribusjon eller telefonintegrasjoner faktisk er et krav |
| Full omskriving til separate native apper | Størst plattformspesifikk kontroll, men mer kode og arbeid                      | Ikke begrunnet av funnene nå                                                |

[Capacitor er laget for å bruke webkode på iOS og Android](https://capacitorjs.com/docs). Det fjerner ikke behovet for backend, testing eller appbutikkenes godkjenning. På iPhone har web-push egne vilkår, blant annet støtte for hjemskjermapper fra iOS 16.4; det er ikke det samme som dagens varselbjelle. Se [WebKits beskrivelse](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

Velg et uttrykkelig støttenivå før lansering. Test fysisk på både en eldre støttet iPhone og en nyere iPhone, samt en rimelig og en nyere Android-telefon. Ta med Safari, Chrome og installert modus. Enhetsemulering er nyttig, men erstatter ikke telefoner.

## Kontroller gjennomført

| Kontroll                                                 | Resultat                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                          | Bestått: formattering, lint, TypeScript, tester og produksjonsbygg                                                     |
| Node-/Vitest-tester                                      | 89 + 86 = 175 bestått                                                                                                  |
| `npm audit --omit=dev`                                   | Ingen kjente sårbarheter rapportert i produksjonsavhengigheter ved kontrollen; ikke en sikkerhetsrevisjon av egen kode |
| Playwright, Chromium, to arbeidere, stoppgrense fem feil | 12 bestått, 5 feilet, 1 avbrutt, 82 ikke kjørt; kjøringen stoppet ved feilgrensen                                      |
| Safari/WebKit, Firefox og fysiske telefoner              | Ikke kjørt i denne gjennomgangen                                                                                       |

Nettleserfeilene gjelder testkjøp, utsolgt-/betalingsscenario, statusendring, fiskestart og fangstflyt. Blant forventningene finnes gammel hjemskjermtekst og forventning om «Aktiv fiskeøkt» etter start. Disse må gjennomgås mot ønsket oppførsel: oppdater utdaterte tester og rett eventuelle reelle feil. Ikke fjern tester bare for å få grønt resultat. Hele pakken er ikke godkjent.

Lokale kjørelogger: `output/readiness-check.txt`, `output/readiness-browser-tests.txt` og `output/readiness-dependency-audit.txt`.

`playwright.config.ts` har ingen eksplisitt matrise for flere nettlesermotorer. PR-kontrollen kjører Chromium; publiseringsløpet bygger uten hele nettleserpakken. En grønn publisering er derfor ikke bevis på at alle brukerflyter fungerer. Utvid kontrollene med [Playwrights nettlesere](https://playwright.dev/docs/browsers) og deretter fysiske enheter.

## Forslag til rekkefølge

### Trinn 1: klar for videreutvikling

Behold designet og funksjonsomfanget. Skill demonstrasjon fra produksjonsoppsett, gjør klokke og datakilder eksplisitte, rett testpakken og oppdater utviklerdokumentasjonen. Samle spredt direkte lagring bak eksisterende datagrensesnitt. Beskytt mot lagringsfeil også når repositories opprettes. Rydd gradvis i overlappende CSS fremfor å starte på nytt.

**Ferdig når:** en ny utvikler kan installere og kjøre prosjektet fra dokumentasjonen, alle avtalte tester består, testdata er tydelig skilt ut, og backend-grensesnitt, miljøvalg og kjent restarbeid er dokumentert. Ingen betaling eller rapport kan fremstå som virkelig levert når den bare er simulert.

### Trinn 2: klar for begrenset pilot

Avklar første lanseringsomfang, mottaker av rapporter, salgsmodell og hvem som eier regeldata. Innfør innlogging, serverlagring og roller. Koble på valgte tjenester i testmiljø. Legg til mobil-/tilgjengelighetstester og en avtalt strategi for dårlig dekning.

**Ferdig når:** samme bruker finner sine data på to enheter, tilgang er kontrollert på serveren, rapporter har leveringskvittering, avbrudd ikke mister data eller dobler ordre, og hovedflytene er prøvd på ekte iPhone og Android. Dersom ekte salg ikke inngår i piloten, må kjøpsfunksjonen fortsatt være tydelig avgrenset som test.

### Trinn 3: klar for vanlig drift

Fullfør reelle integrasjoner og kontroll av regelinnhold. Etabler administrasjon, støtteansvar, sikkerhetskopiering med prøvd gjenoppretting, overvåking uten unødig persondata, databevaring/sletting og rutine for hendelser. Dokumenter publisering, tilbakeføring og hvordan en bruker får ny appversjon. Test tilgangskontroll, misbruk av API-er og filopplasting før lansering.

**Ferdig når:** kritiske flyter består i støttematrise, driftsansvar er avtalt, sikkerhetsgjennomgang er gjort, gjenoppretting er prøvd og det finnes en praktisk plan for feil i kjøp, rapporter eller regelinformasjon. Vurder deretter PWA-distribusjon eller appbutikker ut fra behov.

## Anbefalt neste bestilling

Start med trinn 1 som en avgrenset teknisk oppgave, uten nye designendringer eller nye brukerfunksjoner. Velg ikke backendleverandør eller appbutikkstrategi før salgsmodell, rapportmottaker og pilotomfang er avklart. Dagens arbeid leverer vurderingen; større kodeendringer og push venter på godkjenning.
