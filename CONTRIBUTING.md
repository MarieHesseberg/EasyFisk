# Bidra til EasyFisk

## Arbeidsmåte

1. Opprett en kortlivet gren fra oppdatert `main`.
2. Gjør én sammenhengende endring om gangen.
3. Bevar dagens utseende med mindre en designendring er uttrykkelig avtalt.
4. Kjør `npm run check` før pull request.
5. Beskriv hva som er endret, hvorfor det er endret og hvordan det er kontrollert.

## Språk

- Kodeidentifikatorer og filnavn: engelsk.
- Synlig tekst i appen: norsk bokmål.
- Dokumentasjon og nyttige forklaringer: norsk bokmål.
- Navn fra rammeverk og eksterne API-er beholdes som de er.
- Bruk `EasyFisk` konsekvent som produktnavn.

## Kodestil

- Bruk TypeScript og unngå `any`.
- Foretrekk små, navngitte funksjoner fremfor store anonyme funksjoner i JSX.
- Hold React-komponenter fokuserte på én oppgave.
- Flytt forretningsregler ut av komponenter og test dem som rene funksjoner.
- Bruk tidlige returer når det gjør flyten enklere.
- Ikke behold gammel kode som kommentar eller midlertidig sammenligningskode.
- Ikke deaktiver linting for en hel fil uten en dokumentert grunn.
- Ikke ignorer TypeScript-feil i bygg.
- Kjør Prettier i stedet for å formatere manuelt.

## Filstørrelse

En fil har ingen absolutt maksstørrelse, men bør normalt være under 250 linjer. Når en fil blir større, vurder om data, typer, logikk eller delkomponenter har egne tydelige ansvarsområder.

## Avhengigheter

Legg bare til en avhengighet når den løser et konkret behov bedre enn en liten lokal løsning. Forklar nye avhengigheter i pull requesten. Fjern avhengigheter som ikke brukes.

## Tester

Ny domenelogikk skal ha enhetstester. Feilrettinger bør få en test som viser feilen. Viktige brukerflyter skal etter hvert dekkes av integrasjons- eller ende-til-ende-tester.

## Tilgjengelighet og mobil

- Bruk semantisk HTML.
- Alle interaktive kontroller skal kunne brukes med tastatur.
- Ikonknapper skal ha tilgjengelig navn.
- Mobilbredder fra 360 piksler skal fungere uten vannrett rulling.
- Ta hensyn til trygge områder, skjermtastatur og minst 44 × 44 piksler for viktige berøringsflater.
