# Min prosjektlogg for EasyFisk

Jeg samler de viktigste endringene her, med hvordan appen så ut, hva som ikke fungerte og hvorfor vi endret det. De første notatene er skrevet i ettertid fra GitHub-historikken og EasyFisk-samtalene i Codex. Datoene følger norsk tid; arbeid som gikk over flere dager er samlet. Første dokumenterte versjon i GitHub er fra 19. august 2026.

## 19. august 2026 – Første versjon i GitHub

Jeg la inn prototypen for fiske i Mandalselva og oppsettet for publisering på GitHub Pages. Appen hadde mørkegrønne knapper, kremfarget bakgrunn, avrundede kort og serif-overskrifter. På PC lå den i en telefonramme med et demonstrasjonspanel ved siden av. Fiskestart, fangst, regler og statistikk var samlet i samme prototype. [Første kodeversjon](https://github.com/MarieHesseberg/EasyFisk/commit/8b39ec3).

## 26. august – Fra grønt til blått

Jeg ønsket en blå identitet. Vi byttet hovedfargen og støttefargene gjennom appen, men beholdt oppsettet og tydelige varselfarger. Dette var en endring av utseendet, ikke en ny app. [Endringen](https://github.com/MarieHesseberg/EasyFisk/commit/337adc4).

## 27.–28. august – Ryddigere kode bak samme utseende

Jeg ville beholde designet, men gjøre koden forståelig og lettere å bygge videre på. Nesten hele appen lå i én stor fil, sammen med regler, skjemaer og eksempeldata. Vi tok skjermbilder som referanse, delte koden etter ansvar og fjernet ubrukt startkode. Regler, lagring og skjermbilder fikk tydeligere grenser, og vi la til automatiske kontroller. Blåfargene, de avrundede kortene og telefonvisningen ble beholdt. [Visuell referanse](visual-baseline/README.md) · [Ombyggingen](https://github.com/MarieHesseberg/EasyFisk/commit/4a72de1).

## 28.–29. august – Historikk som faktisk huskes

Jeg ville ha en fungerende lokal prototype, ikke bare eksempelinnhold. Historikk og personlig statistikk begynte å bruke registrerte turer og fangster. Vi rettet bekreftelser som kunne vises selv om lagring feilet, og samlet avslutning av tur og fangster i én lagringsoperasjon. Flere separate skrivinger kunne tidligere etterlate en halvferdig tur. [Samlet lagring](https://github.com/MarieHesseberg/EasyFisk/commit/46c7192) · [Lokal historikk og mobilbruk](https://github.com/MarieHesseberg/EasyFisk/commit/2946759).

## 29. august – Feil som først ble tydelige på iPhone

Jeg fikk ikke brukt hele fangstskjemaet på mobilen. Dialogen kunne havne bak bunnmenyen, og stegmåleren dekket deler av lukkeknappen. Vi flyttet dialogen, rettet lagdelingen og gjorde neste-knappen tilgjengelig på lave skjermer. «Registrer tidligere fisketur» ble tydeligere på hjem. Et stort fangstbilde fylte også nettleserlagringen; først sluttet vi å lagre hele bildet der, og dagen etter fikk bildene egen lagring i IndexedDB. [Dialogrettelse](https://github.com/MarieHesseberg/EasyFisk/commit/63c3491) · [Bildelagring](https://github.com/MarieHesseberg/EasyFisk/commit/c93b989).

## 30. august – Dokumenter, regler og mer troverdig status

Jeg kunne registrere fiskekort, desinfisering og fiskeravgift med vedlegg. Hjem måtte slutte å si at alt var klart når dokumenter manglet: teststatus og registrerte opplysninger var ikke godt nok samordnet. Vi skilte normal bruk fra testsituasjoner og koblet statusen til dokumenter og fangster. Reglene ble kontrollert mot publiserte kilder. Hjem ble roligere uten vannføring og temperaturkort; statistikk flyttet under «Mer» og fikk SSB-tall i stedet for oppdiktet elvestatistikk. [Dokumentstatus](https://github.com/MarieHesseberg/EasyFisk/commit/2400ce0) · [Statistikk](https://github.com/MarieHesseberg/EasyFisk/commit/f62f04f).

## 31. august–1. september – En egen fiskekortbutikk

Jeg ville at EasyFisk skulle ha sin egen kjøpsreise, med Inatur som informasjonskilde. Vi la inn produkter, priser, soner, salgskalender, simulert betaling og en bekreftelse som ble stående. Fiskekort fikk egen fane. Ordre og selve kortet ble separate opplysninger. Kartet låste seg tidligere til sonen i kortet fordi kortbegrensningen også styrte kartvisningen; vi skilte fri utforsking fra retten til å starte fiske. Priser ble undersøkt og rettet underveis; tidlige anslag var merket som simulert. [Kjøpsdata](https://github.com/MarieHesseberg/EasyFisk/commit/0bc4e63) · [Kartrettelse](https://github.com/MarieHesseberg/EasyFisk/commit/f6b011e).

## 1.–2. september – Virkelig kart og roligere farger

Det tegnede kartet ble erstattet av et interaktivt kart med Kartverket-bakgrunn, sonegrenser, zoom og posisjon. Jeg syntes også at appen hadde for mange blånyanser og for lite kontrast mellom boksene. Vi prøvde flere paletter før vi landet på kremhvit bakgrunn, lyse informasjonsflater, dempet elveblå og mørk tekst. Det ga en mer sammenhengende stil. [Kartet](https://github.com/MarieHesseberg/EasyFisk/commit/fe504d4) · [Fargesystemet](https://github.com/MarieHesseberg/EasyFisk/commit/f600b8a).

## 7.–12. september – Engelsk og hjelp til testing

Jeg ønsket engelsk for turister. Språkknappen kom på plass, men mange undersider og feilmeldinger var fortsatt norske. Den første løsningen oversatte tekst på flere forskjellige måter, og små tekstendringer kunne bryte oversettelsen. Vi samlet språket i egne, kontrollerte språkfiler og testet hele flyter. Språkvalget fikk bedre plass ved siden av bjella. Jeg fikk også en enkel testveiledning til familien og spørsmål til arbeidsgiver og fiskere om det som måtte avklares. [Språkarbeidet](https://github.com/MarieHesseberg/EasyFisk/commit/9e15d74) · [Avklaringsspørsmål](docs/stakeholder-clarification-questions.md).

## 12.–16. september – Mindre informasjon på én gang

Jeg fikk tilbakemelding om at appen var overveldende. Funksjonene var ønsket, men det var for mye tekst og for mange steg. Vi lot hjem prioritere det brukeren skulle gjøre nå, forenklet fiskestart og kjøp og samlet ekstra informasjon bak utfoldbare felt. Regler og menyer fikk større skrift. Bunnmenyen og lukkeknappene ble tilgjengelige også inne i skjemaer, og uønsket sidelengs rulling ble fjernet. Kartets sonevalg ble samlet nederst. [Gjennomgangen](docs/brukeropplevelse-gjennomgang.md) · [Forenklingen](https://github.com/MarieHesseberg/EasyFisk/commit/2583db2) · [Navigasjonen](https://github.com/MarieHesseberg/EasyFisk/commit/90d8a9f).

## 17. september – Flere kort og sammenhengende testkjøp

Vi utvidet katalogen med flere lokale delsoner og laget en komplett simulert Vipps-reise. Kortlisten var enkel, med navn, pris og kjøpsknapp; detaljer lå under vilkår. Jeg oppdaget at hjem og «Regler for meg» ikke viste kjøpte kort slik jeg forventet. Vi rettet visningen slik at også kommende og utløpte kort fikk tydelig status og riktig sone. [Kjøpsreisen](https://github.com/MarieHesseberg/EasyFisk/commit/64096fa) · [Kort på hjem og i regler](https://github.com/MarieHesseberg/EasyFisk/commit/a238f03).

## 18. september – Færre gjentakelser og mindre som forsvinner

Vi la til lokal profil, automatisk utfylling, lagrede kladder, kortere kjøp og samlet fangstrapportering. Innmeldinger fikk faktisk lokal lagring, og fangstrettelser fikk historikk. En dato kunne tidligere bli flyttet tilbake til siste sesongdag, slik at et nytt testkort allerede var utløpt. Vi samlet demotiden og rettet datovalget. Personlige regler tok også bedre hensyn til delsonen. [Kladder og klokke](https://github.com/MarieHesseberg/EasyFisk/commit/523e3f2) · [Profil og enklere skjemaer](https://github.com/MarieHesseberg/EasyFisk/commit/94378d6).

## 18. september – Flere fiskedager, regelversjoner og tilbakestilling

Jeg ønsket flere enkeltdager i samme bestilling, kjøp til andre og et klart skille mellom kjøper og fisker. Vi la til dette, regelbekreftelse per versjon og lokale gjeste- og oppsynstilganger. Salgskapasitet ble skilt fra fangstkvoter. Varslene ble mer lesbare, lest-markeringen ble husket, og appen kunne tilbakestilles. Plusstegn og overflødig tekst forsvant, og vi gikk over til skrift uten seriffer. Lokale innleveringssteder og nye sesongdatoer ble ikke gjettet. [Endringene](https://github.com/MarieHesseberg/EasyFisk/commit/e688572) · [Avgrensninger](docs/purchase-and-access-changes.md).

## 18.–19. september – Ny designretning

«Mine fiskekort» ble først større, men hjem så fortsatt ut som en tett stabel med ulike bokser. Jeg ville se større forskjeller enn bare nye farger. Vi undersøkte flere typer apper og laget tolv forslag med forskjellige skrifter, former og oppsett. Lokale bildelenker fungerte ikke på mobilen, så forslagene fikk et eget nettgalleri. Senere ble alle forslag vist åpent, slik at de eldre ikke forsvant i sammenfoldede seksjoner. Dette var forslag; appens design var ennå ikke byttet. [Første designgjennomgang](docs/design-review-2026-09-18/designgjennomgang.md) · [Alle forslagene](https://mariehesseberg.github.io/EasyFisk/designforslag/).

## 19. september – Jeg valgte delene som passet sammen

Jeg valgte billettform på egne fiskekort, elveillustrasjon når brukeren ikke har kort, og en tydelig «Kjøp fiskekort»-knapp. Dokumenter og andre handlinger skulle være rolige rader med lyse ikonsirkler. Jeg ønsket krok for tidligere tur, kartikon på kartfanen og en forenklet laks med bølge som logo. Vi samlet dette med hvitt, petrolblått, lyseblått og dempet grønt, uten «Min lommebok». Deretter laget vi et galleri for resten av appen i samme stil. [Samlet hjemforslag](https://mariehesseberg.github.io/EasyFisk/designforslag/samlet-hjem.html) · [Skjermforslagene](https://mariehesseberg.github.io/EasyFisk/designforslag/helhet/galleri.html).

## 19. september – Designet inn i appen

Jeg godkjente stilen, men ville beholde funksjonene. Appen fikk Nunito Sans, ny logo, illustrasjoner, billettkort og felles utforming. Første gjennomføring beholdt den gamle statusboksen på hjem; det var ikke det avtalte oppsettet, så vi rettet hjemtilstandene etter forslaget. Kartsidens toppfelt og navigasjon fikk samme stil, mens selve kartet ble beholdt. En lokal visning stoppet fordi serveren ikke kjørte. Da mobilen senere viste gammelt design, var ny versjon kontrollert publisert; mellomlagring var en mulig, ikke bekreftet, årsak. [Designet](https://github.com/MarieHesseberg/EasyFisk/commit/4d34acd) · [Kartsiden](https://github.com/MarieHesseberg/EasyFisk/commit/8035c5d).

## 19. september – Arbeidspakke 1–3: grunnlag for videreutvikling

Jeg ønsket å forberede koden for en ordentlig app uten å bygge ferdig lanseringen. Noen nettlesertester forventet gamle skjermbilder og flyter, og deler av koden forutsatte umiddelbar lokal lagring. Vi oppdaterte kontrollene, samlet valg av datakilder og gjorde viktige handlinger klare for forsinkelser og feil. Testklokke og demo ble tydeligere skilt ut. Appen beholdt det godkjente utseendet. Etter denne pakken bestod 185 enhetstester og 100 nettlesertester. [Utviklingsnotatet](docs/development-foundation.md).

## 19. september – Arbeidspakke 4–5: stabile data og norsk tid

Turer og fangster fikk tydeligere ID-er og koblinger, og lagringsformatene ble versjonert med støtte for eldre data. Vi samlet tidsbehandlingen slik at telefonens tidssone ikke flytter nye fiskedatoer og kortgrenser. Gamle tidspunkter ble ikke gjettet om. Utseendet og kartet var uendret. Nå bestod 198 enhetstester og 102 nettlesertester, sammen med kodekontroller og bygg. Jeg ba deretter om å pushe arbeidspakke 1–5. [Utviklingsnotatet](docs/data-and-time-foundation.md) · [Pushet kode](https://github.com/MarieHesseberg/EasyFisk/commit/e4cf4b7).

## 19. september – Fast prosjektlogg videre

Jeg samlet historikken i denne loggen og ba om korte notater etter større endringer. Appen har nå et bedre teknisk grunnlag, men er fortsatt en lokal prototype. Ekte innlogging, betaling, serverlagring og levering av rapporter gjenstår, sammen med videre testing på fysiske iPhone- og Android-telefoner. Dette arbeidet endrer dokumentasjonen, ikke appens utseende eller funksjoner.

---

Grunnlaget er de 111 commitene som fantes i `main` før arbeidspakke 1–5, øvrige tilgjengelige Git-grener, de sju relevante EasyFisk-samtalene i Codex og prosjektets dokumentasjon. Lenker ved notatene peker til utvalgte holdepunkter, ikke hver smårettelse. Hele [commit-historikken](https://github.com/MarieHesseberg/EasyFisk/commits/main/) er bevart. Jeg tar med bekreftede feilårsaker og markerer usikkerhet der årsaken ikke er fastslått.
