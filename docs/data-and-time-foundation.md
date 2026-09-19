# Arbeidspakke 4–5: datamodeller og tidsbehandling

Arbeidet bygger videre på [arbeidspakke 1–3](development-foundation.md). Skjermenes oppsett, kartet og fiskereglene beholdes. Endringene gir et mer forutsigbart datagrunnlag før innlogging, server og reelle integrasjoner innføres.

## 4. Identitet, lagringsformat og validering

- Nye fisketurer har tilfeldig generert ID fra oppstart. Den beholdes ved gjenåpning og avslutning. Etterregistrerte turer beholder ID i kladden, også ved nytt lagringsforsøk.
- Nye fangster har egen tilfeldig ID og `sessionId` som peker til turen. Historikk og statistikk bruker koblingen først. To turer kan dermed ha samme starttid uten at nye fangster kobles til begge.
- `sessionStart` og eksisterende ID-er beholdes for bakoverkompatibilitet. Eldre fangster uten `sessionId` bruker fortsatt starttid som reserve. Tvetydige historiske koblinger kan ikke repareres sikkert uten mer informasjon; de skal ikke gjettekobles ved migrering.
- Nye turer, fangster og utstedte fiskekort har `zoneId`. Teksten er fortsatt tilgjengelig for visning. Nye utstedte kort beholder også `productId` og `rulesVersion`. Eldre kort og manuelt registrerte kort kan fortsatt hente sone fra teksten.
- Kjøper og fisker, ordre og utstedte dokumenter forblir separate eksisterende begreper. Migrering endrer ikke hvem kjøpet gjelder eller knytningen til dokumenter, bilder og regelhistorikk. Ingen profil blir gjort om til en verifisert konto.
- Lagringsgrensene kontrollerer blant annet ID-er, duplikater, datoer, endelig tallverdi, ikke-negative målinger/priser, kjente dokumentverifikasjoner og gyldige soner. TypeScript alene validerer ikke data som leses fra lagring.

### Formater og migrering

| Lager                                       | Eldre format som leses | Format ved neste lagring                                 |
| ------------------------------------------- | ---------------------- | -------------------------------------------------------- |
| Fiskelogg, nøkkel `easyfisk:fishing-log:v1` | Loggversjon 1 og 2     | `version: 3`, med samme lister og eksisterende historikk |
| Fiskekortkjøp, samme nøkkel som før         | Uversjonert liste      | `{ schemaVersion: 1, records: [...] }`                   |
| Rapporteringsdøgn, samme nøkkel som før     | Uversjonert liste      | `{ schemaVersion: 1, records: [...] }`                   |
| Dokumenter i IndexedDB                      | Uversjonert dokument   | Samme dokument med `schemaVersion: 1`                    |

Nøklene og IndexedDB-butikkene byttes ikke. Dataversjon og navnet på lagringsnøkkelen er forskjellige begreper. Dokumentvedlegg beholdes som `Blob`, uten konvertering gjennom JSON.

Lesing migrerer bare i minnet. Den gamle verdien erstattes først ved en vellykket skriving. Ugyldige data, ukjente framtidige versjoner og duplikate ID-er gir feil, ikke en tom liste. Fiskelogg valideres også før skriving. En feil under skriving lar den gamle lagrede verdien stå. Brukerens uttrykkelige tilbakestilling er fortsatt en egen slettehandling.

Ikke nedgrader til en appversjon som ikke kan lese de nye formatene uten en avtalt datamigrering. Før ekte data innføres må serverens skjema, tilgangskontroll, sikkerhetskopi, transaksjoner og idempotens etableres. Dette arbeidet gir ikke synkronisering eller beskyttelse mot samtidige skriv fra flere faner/enheter.

## 5. Kalenderdato, norsk klokkeslett og faktisk tidspunkt

`domain/shared/river-time.ts` er felles grense for tidskonvertering:

| Opplysning                                     | Representasjon                            | Betydning                                                            |
| ---------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| Fødselsdato, fiskedato, sesongdato             | `YYYY-MM-DD`                              | Kalenderdato, uten tidssonekonvertering                              |
| Tid skrevet i norske skjemaer                  | `YYYY-MM-DDTHH:mm`                        | Lokalt klokkeslett i `Europe/Oslo`                                   |
| Faktisk hendelse                               | Heltall i millisekunder siden Unix-epoken | Et bestemt tidspunkt, uavhengig av telefonens innstillinger          |
| Innkommende tidsstreng med `Z` eller UTC-avvik | Strengt ISO-format                        | Avviket bestemmer tidspunktet; det skal ikke tolkes om som lokal tid |

Kortgyldighet, gjestetilgang, desinfisering, etterregistrering, kvotedato og datovisning bruker nå samme norske tidsgrunnlag. Fødselsdato kontrolleres som kalenderdato. Datoer som 30. februar og klokkeslett som 24:00 avvises. Døgnregning bruker kalenderdager når hensikten er forrige eller neste dato, ikke alltid 24 timer.

Ved overgang til sommertid finnes enkelte klokkeslett ikke: `2026-03-29T02:30` avvises. Ved overgang til vintertid forekommer `2026-10-25T02:30` to ganger: verdier uten avvik tolkes konsekvent som første forekomst. Konverteringen støtter også eksplisitt siste forekomst eller avvisning. Et framtidig skjema for valg av begge forekomstene er ikke innført. Et eksplisitt UTC-avvik kan skille dem.

Eksisterende kortgrenser er beholdt, inkludert sluttidens inklusivitet. En grense på 17:59 betyr fortsatt det lagrede tidspunktet 17:59:00; vi har ikke endret lokale regler til å gjelde ut minuttet. Desinfiseringens eksisterende varighet på 20 × 24 timer er også beholdt. Eventuelle endringer i disse reglene må avklares separat.

Tidligere lagrede numeriske tidspunkter flyttes ikke. Dersom en eldre prototype allerede lagret en etterregistrering feil på en utenlandsk telefon, kan riktig tidspunkt ikke utledes sikkert uten original tidssone. Nye registreringer bruker norsk tid. Testklokken fra pakke 1–3 beholdes i demomodus; virkelig servertid innføres først med serveren.

Bakgrunn: JavaScript tolker dato og klokkeslett uten UTC-avvik i enhetens lokale tidssone, mens eksplisitt `timeZone` styrer formatering. Se [Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) og [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat). Derfor brukes ikke vanlig parsing av slike strenger ute i funksjonsområdene.

## Kontroll

- `tests/data-evolution.test.mjs`: eldre data, dataversjoner, avvisning uten overskriving, vedlegg, ID-er og turkoblinger.
- `tests/model-links.test.tsx`: oppstart, gjenåpning, to fangster og avslutning med samme tur-ID.
- `tests/river-time.test.mjs`: skuddår, datooverløp, årsskifte, sommertid/vintertid, kortgrenser og samme resultat med Oslo, UTC, Los Angeles og Tokyo som enhetstidssone.
- `tests/visual/river-time.spec.ts`: kortvisning og faktisk etterregistrering i mobil nettleser med amerikansk og japansk tidssone, inkludert gjenåpning.
- Eksisterende enhets- og nettlesertester skal fortsatt bestå, uten å oppdatere referansebilder for å skjule forskjeller.

Testene erstatter ikke kontroll på fysisk iPhone og Android. Ingen nye regler eller datoene 1. mars og 15. september er innført.
