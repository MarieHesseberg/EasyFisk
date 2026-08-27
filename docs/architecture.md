# Arkitektur for EasyFisk

## Mål

EasyFisk skal være enkelt å forstå, enkelt å utvide og uavhengig av framtidig database- eller API-leverandør. Arkitekturen skal vokse med faktiske behov og ikke introdusere abstraksjoner uten en konkret bruker.

## Retning

Den eksisterende prototypen ligger foreløpig i `app/page.tsx`. Den skal deles opp gradvis uten å endre utseende eller oppførsel.

Målstruktur:

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
  quotas/
  sessions/
  zones/

data/
  mock/

hooks/
lib/
styles/
tests/
```

Mappene opprettes først når de får reelt innhold.

## Ansvarsdeling

### `app`

Definerer ruter, sideoppsett og kobler sammen funksjoner. Rutefiler skal være små.

### `features`

Inneholder brukerrettede funksjoner. En funksjon kan ha komponenter, lokale typer, hjelpefunksjoner og tester som hører tett sammen.

### `domain`

Inneholder forretningsregler og sentrale modeller. Koden skal være uavhengig av React, nettleser og database når det er mulig.

### `components/ui`

Inneholder små gjenbrukbare visningskomponenter uten kunnskap om fiskeregler eller datalagring.

### `data`

Inneholder implementasjoner som leser eller lagrer data. React-komponenter skal bruke tydelige grensesnitt i stedet for å kjenne databasen direkte.

## Framtidige datakilder

Database og API legges til bak små grensesnitt. Et fangstlager kan for eksempel tilby `save` og `list`, mens en midlertidig minneimplementasjon og en framtidig databaseimplementasjon følger samme kontrakt.

Dette gjør at brukergrensesnitt og domenelogikk kan testes uten database, og at leverandør kan byttes uten å skrive om skjermene.

## Tilstand

- Lokal visningstilstand kan bruke `useState`.
- Sammenhengende arbeidsflyter bør bruke en reducer eller en egen hook.
- Delt serverdata skal senere hentes gjennom et datalag.
- Avledede verdier skal beregnes, ikke lagres som duplisert tilstand.

## Visuell stabilitet

Alle strukturelle refaktoreringer sammenlignes med `visual-baseline`. Avvik skal være bevisste produktendringer, ikke bivirkninger av ny kode.

