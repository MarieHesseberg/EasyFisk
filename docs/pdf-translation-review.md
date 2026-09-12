# Oppfølging av EasyFisk.pdf

PDF-en inneholder 27 feilmeldinger fra 10. september 2026 og seks sider med skjermbilder. Alle gjelder manglende engelsk tekst. Gjennomgangen gjelder den lokale appen; publisering er en egen handling.

## Årsak og retting

Det påbegynte oversettelsessystemet brukte katalognøkler, mens flere datakilder og betingede meldinger fortsatt leverte norsk kildetekst. Ukjente tekster ble vist uendret. Kontrollen av synlige JSX-tekster fanget ikke opp disse tilfellene.

- Hele, kjente kildetekster slås nå opp i samme tospråklige katalog som UI-nøklene. Ingen DOM-omskriving eller vilkårlig ordutskifting brukes.
- Produktbeskrivelser, kartsoner, varsler, dokumentfelt, rapportkategorier og profilmenyer har engelske tekster.
- Regeltekster med kvoter og andre variabler har eksplisitte språkvarianter.
- Betingede knapper, tilgjengelighet i kalenderen, simulerte priser og dokumentfeil er oversatt.
- Eldre lagrede øktresultater vises på valgt språk uten å endre lagrede data. Fritekst i dokumenter bevares; bare datoer og faste kategorier formateres.
- Eksisterende, ikke-innsjekkede endringer er bevart og bygget videre på.

## Dekning av rapporten

| PDF-nr. | Område                                                      | Kontroll                                                       |
| ------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| 1       | Varsler på hjemskjermen                                     | Alle tre varseltekster i nettlesertest                         |
| 2       | «Se hva som mangler»                                        | Stegteller, status, dokumentkrav og handlingsknapper           |
| 3       | Registrering av tidligere tur                               | Tur med og uten fangst, bekreftelse og historikk               |
| 4–6     | Fiskekort, desinfisering og fiskeravgift                    | Skjemaer, valg, veiledning og valideringsfeil                  |
| 7–10    | Kjøp fiskekort, sone 1–4                                    | Samtlige produkter og detaljvisninger; testkjøp av sone 3-kort |
| 11      | Melding til elveeigarlaget                                  | Kategorier, gjennomgang og bekreftelse                         |
| 12–15   | Kart, sone 1–4                                              | Sonetekster, sesong, produktutvalg og lenke til butikk         |
| 16–24   | Regler og alle utvidbare regelbokser                        | Overskrifter, sammendrag og alle avsnitt                       |
| 25–27   | Mer, profil, dokumenter, varsler, statistikk og statusmotor | Menyer, detaljer, språkbytte og sentrale brukerflyter          |

## Regresjonskontroll

Verifisert 12. september 2026: `npm run check` bestått med 89 domenetester og 48 komponent-/lokaliseringstester. Alle 38 nettlesertilfeller bestått; én eldre forventning til lagringsfeilmeldingen ble oppdatert og kontrollert på nytt. Norske visuelle referanser og mobilvisning på engelsk er kontrollert.

`tests/pdf-report-localization.test.tsx` kontrollerer hele datagrunnlaget som omtales i rapporten, inkludert kalenderstatus, priser, dokumentfeil og eldre historikk.

`tests/visual/pdf-report.visual.spec.ts` følger varslene, manglende dokumenter og alle fire soner gjennom kart og produktdetaljer. Den kontrollerer også mobilbredde og tilbakebytte til norsk etter omlasting.

De eksisterende engelske flyttestene ligger i `tests/visual/home-screen.visual.spec.ts`; norske hovedflyter ligger i `tests/visual/critical-user-flows.spec.ts`.

Kjør `npm run check` og `npm run test:visual -- --workers=2` før publisering. Dette er fortsatt en lokal prototype med simulerte betalinger og rapportinnsendinger. Eksterne kildesider og brukerens egne fritekster oversettes ikke.
