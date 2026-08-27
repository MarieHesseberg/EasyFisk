# Arkitektur for EasyFisk

## Mål

EasyFisk skal være enkelt å forstå, enkelt å utvide og uavhengig av framtidig database- eller API-leverandør. Arkitekturen skal vokse med faktiske behov og ikke introdusere abstraksjoner uten en konkret bruker.

## Retning

Prototypen er delt etter ansvar uten å endre utseende eller oppførsel. Den aktive strukturen er:

```text
app/
  layout.tsx
  page.tsx

components/
  layout/
  ui/

features/
  home/
  map/
  fishing-session/
  catch-report/
  history/
  statistics/
  rules/
  feedback/
  profile/

domain/
  catches/
  fishing-rules/
  navigation/
  quotas/
  sessions/
  zones/

data/
  contracts/
  local-storage/
  memory/
  mock/
  repositories/

hooks/
lib/
styles/
tests/
```

Alle mappene har reelt innhold. Nye filer skal normalt holdes mellom 150 og 250 linjer eller
kortere. En fil kan være lengre når én sammenhengende arbeidsflyt blir vanskeligere å forstå av
å deles, men dette skal være et bevisst unntak.

## Ansvarsdeling

### `app`

Definerer ruter, sideoppsett og kobler sammen funksjoner. Rutefiler skal være små.

### `features`

Inneholder brukerrettede funksjoner. En funksjon kan ha komponenter, lokale typer, hjelpefunksjoner og tester som hører tett sammen.

### `domain`

Inneholder forretningsregler og sentrale modeller. Koden skal være uavhengig av React, nettleser og database når det er mulig.

Fangstvalidering, størrelsesregler, kvoter, rapporteringsfrister, økttid,
soneregler og statuskontroller er rene funksjoner i dette laget. Grenseverdiene
dekkes av direkte enhetstester i `tests/domain-rules.test.mjs`.

### `components/ui`

Inneholder små gjenbrukbare visningskomponenter uten kunnskap om fiskeregler eller datalagring.

### `components/layout`

Kobler sammen navigasjon, skjermbilder og overordnet applikasjonstilstand. Rutefilene kjenner
bare dette laget.

### `application`

Inneholder enkle kontrollere som eier applikasjonstilstand og brukerhandlinger. Skjermkomponenter
skal vise data og sende handlinger videre, ikke koordinere hele arbeidsflyter selv.

### `hooks`

Inneholder gjenbrukbar React-logikk, som tidsmåling og kortvarige meldinger.

Store arbeidsflyter deles i en navngitt kontroller under `hooks/` og små steg under
`steps/`. Fangstrapporten og oppstart av fiske følger denne strukturen.

### `data`

Inneholder implementasjoner som leser eller lagrer data. React-komponenter skal bruke tydelige grensesnitt i stedet for å kjenne databasen direkte.

- `contracts/` beskriver hva appen trenger fra en datakilde.
- `local-storage/` gir prototypen versjonert lagring som overlever oppdatering av siden.
- `memory/` lagrer brukerdata midlertidig mens appen kjører.
- `mock/` inneholder lokale eksempeldata og adapteren som leser dem.
- `repositories/` velger aktiv adapter. En framtidig API- eller databaseadapter kobles inn her.

Bare filer under `data/` kan importere fra `data/mock`. Komponenter og domenelogikk bruker den
konfigurerte repository-eksporten. Denne grensen håndheves av en automatisk test.

## Versjonerte fiskeregler

`domain/fishing-rules/mandalselva-2026.ts` er eneste kilde for aktiv regelversjon, sesongdatoer,
størrelsesgrenser, kvoter, rapporteringsfrist og temperaturgrense. Domenefunksjoner og
brukergrensesnitt skal lese disse verdiene gjennom `activeFishingRules`; de skal ikke gjenta
årstall, datoer eller tallgrenser lokalt.

Ved en ny sesong opprettes en ny versjonert fil. Eksporten `activeFishingRules` flyttes først etter
at innhold og tester for den nye sesongen er kontrollert. Dermed kan eldre regler beholdes for
historiske rapporter og framtidig datamigrering.

## Framtidige datakilder

Database og API legges til bak små grensesnitt. `FishingContentRepository` leverer soner, regler og
demonstrasjonsscenarioer. `FishingLogRepository` lagrer økter og fangster. Den aktive
minneimplementasjonen brukes i tester, mens nettleserprototypen bruker `localStorage`. Begge kan
senere erstattes med en databaseadapter uten å endre skjermene eller domenereglene.

Dette gjør at brukergrensesnitt og domenelogikk kan testes uten database, og at leverandør kan byttes uten å skrive om skjermene.

## Tilstand

- Lokal visningstilstand kan bruke `useState`.
- Sammenhengende arbeidsflyter bør bruke en reducer eller en egen hook.
- Delt serverdata skal senere hentes gjennom et datalag.
- Avledede verdier skal beregnes, ikke lagres som duplisert tilstand.

## Visuell stabilitet

Alle strukturelle refaktoreringer sammenlignes med `visual-baseline`. Avvik skal være bevisste produktendringer, ikke bivirkninger av ny kode.

## Responsivitet og tilgjengelighet

- Mobilvisningen fyller tilgjengelig dynamisk høyde fra 360 piksler bredde.
- Trygge områder brukes rundt topp, bunn og fast navigasjon på enheter med utskjæring.
- Nettbrett viser appen sentrert i en romsligere ramme, mens skrivebord beholder demonstrasjonspanelet.
- Dialoger låser bakgrunnen, flytter fokus inn, holder Tab-fokus inne og kan lukkes med Escape.
- Dialoginnhold ruller innenfor dynamisk visningshøyde, også når skjermtastaturet reduserer plassen.
- Interaktive kontroller har minst 44 piksler berøringshøyde og tydelig tastaturfokus.
- Redusert bevegelse respekteres gjennom `prefers-reduced-motion`.

## Stilark og designtokens

Appen bruker vanlig CSS uten Tailwind. Felles farger og tilstander defineres som semantiske tokens
i `styles/foundations.css`. Feature-stilark skal bruke disse tokenene for delte flater, tekst,
rammer og statusfarger. Lokale fargeverdier er bare tillatt for særskilt illustrasjon, kart eller
visualisering som ikke representerer en gjenbrukbar UI-tilstand.
