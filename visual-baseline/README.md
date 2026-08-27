# Visuell referanse for EasyFisk

Denne mappen beskriver utseendet og den forventede oppførselen som skal bevares under ombyggingen av EasyFisk. Referansen er hentet fra den publiserte versjonen 27. august 2026.

## Formål

Ombyggingen kan endre filstruktur, komponentgrenser, tilstandshåndtering, datakilder og teknisk implementasjon. Følgende skal likevel oppleves likt:

- farger, typografi, ikoner, kort, knapper og avstander
- informasjonsrekkefølge og visuell prioritering
- hovednavigasjon og navn på faner
- innhold og rekkefølge i arbeidsflyter
- statusfarger for godkjent, advarsel og blokkert
- mobilopplevelsen som en fullskjermsapp
- prototypevisningen med telefonramme og demonstrasjonspanel på store skjermer

## Referansestørrelser

| Profil            | Visningsflate | Bruk                                                           |
| ----------------- | ------------: | -------------------------------------------------------------- |
| Kompakt mobil     |     360 × 800 | Minste støttede mobilbredde                                    |
| iPhone-referanse  |     390 × 844 | Primær visuell referanse                                       |
| Android-referanse |     412 × 915 | Vanlig Android-størrelse                                       |
| Stor mobil        |     430 × 932 | Store iPhone- og Android-modeller                              |
| Nettbrett         |    768 × 1024 | App sentrert eller tilpasset tilgjengelig bredde               |
| Skrivebord        |    1440 × 900 | Telefonprototype og demonstrasjonspanel ved siden av hverandre |

Appen skal ikke kreve en bestemt telefonmodell. Bredder fra 360 til 430 piksler skal fungere uten vannrett rulling, avkuttet tekst eller knapper utenfor skjermen.

## Skjermreferanser

### Hovedskjermer

| Skjerm     | iPhone                                                 | Android                                           |
| ---------- | ------------------------------------------------------ | ------------------------------------------------- |
| Hjem       | [390 × 844](screenshots/iphone-390x844-home.png)       | [412 × 915](screenshots/android-412x915-home.png) |
| Kart       | [390 × 844](screenshots/iphone-390x844-map.png)        | [412 × 915](screenshots/android-412x915-map.png)  |
| Regler     | [390 × 844](screenshots/iphone-390x844-rules.png)      | —                                                 |
| Statistikk | [390 × 844](screenshots/iphone-390x844-statistics.png) | —                                                 |
| Mer        | [390 × 844](screenshots/iphone-390x844-more.png)       | —                                                 |

### Detaljer og arbeidsflyter

| Tilstand                       | Referanse                                                         |
| ------------------------------ | ----------------------------------------------------------------- |
| Fiskekortdetaljer              | [Mine fiskekort](screenshots/iphone-390x844-detail-permits.png)   |
| Tilbakemelding, steg 1         | [Opprett melding](screenshots/iphone-390x844-feedback-step-1.png) |
| Oppstart, statuskontroll       | [Steg 1](screenshots/iphone-390x844-start-flow-status.png)        |
| Oppstart, posisjon             | [Steg 2](screenshots/iphone-390x844-start-flow-position.png)      |
| Oppstart, sonevalg             | [Steg 3](screenshots/iphone-390x844-start-flow-zone.png)          |
| Oppstart, regelbekreftelse     | [Steg 4](screenshots/iphone-390x844-start-flow-confirm.png)       |
| Aktiv fiskeøkt                 | [Aktiv økt](screenshots/iphone-390x844-active-session.png)        |
| Fangstrapport, art og resultat | [Steg 1](screenshots/iphone-390x844-catch-report-step-1.png)      |
| Fangstrapport, detaljer        | [Steg 2](screenshots/iphone-390x844-catch-report-step-2.png)      |
| Fangstrapport, regelkontroll   | [Steg 3](screenshots/iphone-390x844-catch-report-step-3.png)      |

### Skrivebord

- [Hjem, 1440 × 900](screenshots/desktop-1440x900-home.png)

På skrivebord skal telefonen beholde den kompakte appformen. Demonstrasjonspanelet skal vises ved siden av telefonen når det er nok plass. På mobil skal demonstrasjonspanelet skjules, og appen skal bruke hele visningsflaten.

## Forventet navigasjon

Bunnavigasjonen er tilgjengelig på alle hovedskjermer og inneholder, i denne rekkefølgen:

1. Hjem
2. Kart
3. Regler
4. Statistikk
5. Mer

Valgt fane markeres med primærfargen. Navigasjonen skal ligge fast nederst uten å dekke innhold. På enheter med hjemindikator skal det brukes trygg avstand nederst.

## Viktige arbeidsflyter

### Starte fiske

1. Brukeren velger **Start fiske**.
2. Statuskontrollen viser fiskekort, avgift, desinfisering, kvoter, temperatur og sesong.
3. Brukeren velger posisjonstilgang eller manuelt sonevalg.
4. Foreslått sone kan endres.
5. Viktige regler for valgt sone vises og bekreftes.
6. Økten starter, og brukeren sendes til sin statistikk og fiskehistorikk.

### Aktiv fiskeøkt

- Aktiv sone og løpende tid vises tydelig.
- Brukeren kan registrere fangst, se sone og regler eller stoppe økten.
- Aktiv økt markeres i bunnavigasjonen.

### Registrere fangst

1. Velg art og resultat.
2. Registrer lengde, vekt, valgfritt bilde og kommentar.
3. Vis automatisk regelkontroll og oppsummering.
4. Send rapport og vis kvoteoppdatering og rapport-ID.

### Stoppe fiske

- Brukeren velger om økten hadde fangst eller nullfangst.
- Fangst leder til fangstrapport før økten avsluttes.
- Nullfangst lagres direkte før sammendraget vises.

### Tilbakemelding

1. Velg kategori og skriv beskrivelse.
2. Legg eventuelt ved bilde og posisjon.
3. Kontroller meldingen.
4. Bekreft personvern og send.

## Regler for responsivt design

- Ingen vannrett rulling fra 360 piksler og oppover.
- Innhold skal kunne rulle loddrett uten at bunnavigasjonen forsvinner.
- Modaler og arbeidsflyter skal bruke tilgjengelig høyde og ha intern rulling ved behov.
- Interaktive flater skal være minst 44 × 44 piksler der det er praktisk mulig.
- Tekst skal tåle nettleserens tekstforstørrelse uten overlapping.
- Skjermtastaturet skal ikke skjule aktivt felt eller hovedhandlingen.
- Trygge områder for hakk, statuslinje og hjemindikator skal støttes med `env(safe-area-inset-*)`.
- Nettbrett skal ikke strekke innholdet til uleselig bredde.
- Skrivebordsvisningen skal beholde telefonrammen og demonstrasjonspanelet.
- `prefers-reduced-motion` skal respekteres når animasjon legges til.

## Visuelle kjennetegn som skal bevares

- varm, lys bakgrunn og mørk blågrå tekst
- blå primærfarge med lyse blå støtteflater
- serif-overskrifter og tydelige sans-serif-kontroller
- store avrundede kort og knapper
- kompakte etiketter med store bokstaver og bokstavavstand
- hvite innholdskort med diskrete skillelinjer
- fast bunnavigasjon med fem like brede valg
- korallfarget varslingspunkt
- gule advarsler og røde blokkerte eller farlige tilstander

## Godkjenningskrav for ombyggingen

En ombygd skjerm er visuelt godkjent når:

1. den har samme innhold, rekkefølge og hovedhandling som referansen
2. farger, typografi, radius, avstand og ikonstørrelser ikke har merkbar drift
3. den fungerer ved 390 × 844 og 412 × 915
4. den ikke har avkuttet innhold eller vannrett rulling ved 360 piksler
5. modaler kan brukes med liten skjermhøyde og skjermtastatur
6. navigasjon og tilbakehandlinger gir samme resultat som beskrevet over
7. statusene godkjent, advarsel og blokkert fortsatt er lette å skille

Denne referansen skal oppdateres med en bevisst forklaring dersom produktdesignet senere endres. Den skal ikke endres bare for å få en kodeendring til å passe.
