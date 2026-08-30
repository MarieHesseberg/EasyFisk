# Testmatrise for fiskekortprototypen

Sist kontrollert: 31. august 2026.

Fiskekortbutikken er en prototype. Produktregisteret er et datert øyeblikksbilde, tilgjengelighet
og betaling er simulert, og ingen penger trekkes. Testene skal derfor kontrollere brukerflyt og
lokal sammenheng i appen, ikke sanntidsdata hos en ekstern salgsaktør.

## Automatisert dekning

| Område          | Kontroll                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Innganger       | Butikken kan åpnes fra hjemskjermen, kartet, «Mer» og «Mine fiskekort».                                   |
| Produktvalg     | Døgnkort, sesongkort og gruppekort finnes, og produkter kan filtreres på sone og salgsområde.             |
| Tilgjengelighet | Ledig, få igjen, utsolgt og ikke i salg håndteres uten å fremstilles som sanntidsdata.                    |
| Dato            | Valgt fiskedato påvirker produktstatus og gyldigheten til et kjøpt testkort.                              |
| Testbetaling    | Godkjent, avbrutt og feilet betaling har egne utfall. Bare godkjent betaling oppretter kort.              |
| Sammenheng      | Testkjøpet vises i «Mine fiskekort», oppdaterer dokumentstatus og begrenser sonevalget.                   |
| Lokal lagring   | Et kjøpt testkort overlever oppdatering av siden og kan fjernes ved nullstilling.                         |
| Mobil           | Kritiske flyter kjøres på iPhone- og Android-bredde med scroll, fokus og Escape-lukking.                  |
| Regresjon       | Eksisterende dokumentregistrering, fiskeøkter, fangst og etterregistrering kjøres i samme nettleserpakke. |
| Visuelt         | Hjemskjermen sammenlignes med godkjente referansebilder for desktop, iPhone og Android.                   |

Testene ligger hovedsakelig i `tests/visual/critical-user-flows.spec.ts`,
`tests/visual/home-screen.visual.spec.ts` og `tests/component-flows.test.tsx`.

## Kjøring

```bash
npm run check
npm run test:visual
```

`npm run check` kontrollerer formatering, linting, TypeScript, domenetester, komponenttester og
produksjonsbygg. `npm run test:visual` starter den eksporterte appen og kjører Playwright-testene i
en virkelig nettleser.
