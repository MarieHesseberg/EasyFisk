# Kjøp, regler og tilgang

- Døgnkort: flere enkeltdager i én ordre, pris per valgt dato og ett dokument per dag. Appen lagrer dokumentene i én IndexedDB-transaksjon. Ukekort skjules i butikken; eldre kjøp kan fortsatt leses.
- Kjøper og fisker lagres separat. Kort kjøpt til andre teller ikke som kjøperens fiskerett.
- Regelbekreftelser lagres per lokal profil og regelversjon. Historiske regelsett er egne filer som ikke skal overskrives. Opprett en ny versjonsfil og oppdater register/aktiv versjon ved endringer. Ingen tidligere regelversjoner er diktet opp.
- Produktets sesong, sperrede datoer og ukedager styrer tilgjengelighet. Salgskapasitet er separat fra personlige fangstkvoter. Manglende salgsgrense betyr ubegrenset salg.
- Grunneierkort kan registreres lokalt under Mine fiskekort. Tildel gjestekort eller oppsynstilgang til navn/e-post, innenfor kortets område og tidsrom. Tilgang kan tilbakekalles. Oppsyn gir ikke fiskerett. Dette er ikke verifisert tilgang mellom virkelige brukerkontoer: løsningen trenger autentisering, grunneierkontroll og serverlagring før reell bruk.
- Ved avvik beholdes faktisk fangst og forklaring. Innleveringsinstruks må bekreftes lokalt før den legges i local-delivery-guidance.ts. Inntil da vises kontakt med lokalt oppsyn uten et oppdiktet leveringssted.

## Uavklarte datoer

1. mars er ikke innført som ny regel. 15. september fantes allerede i det arkiverte 2026-regelgrunnlaget for deler av sone 4; dette er bevart som eksisterende data, ikke utvidet til nye soner. Avklar hvilke datoer og soner som skal gjelde før en ny regelversjon publiseres.
