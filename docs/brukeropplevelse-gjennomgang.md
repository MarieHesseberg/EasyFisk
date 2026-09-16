# EasyFisk – enklere skjermer og brukerreiser

Gjennomgang 12. september 2026. Målet er å beholde funksjonene, redusere mengden informasjon som vises samtidig og gjøre de vanligste oppgavene enklere.

## Hovedvurdering

Appen har en tydelig identitet og nyttige funksjoner. Overveldelsen kommer særlig av at **oversikt, forklaring, kontroll og handling får nesten like stor plass**. Brukeren må lese mye for å finne ut hva som faktisk skal gjøres.

Tre endringer vil gi størst forskjell:

1. La hjemskjermen følge situasjonen: før fiske, under fiske og etter fiske.
2. Flytt aktive handlinger foran statistikk og dokumentforklaringer.
3. Slå sammen skjermsteg som bare gjentar kjent informasjon. Vis ekstra kontroll når noe krever oppmerksomhet.

Dette er en vurdering av den lokale prototypen, ikke en brukertest eller en kontroll av gjeldende fiskeregler. Forslagene til effekt og antall steg er designmål som må prøves med brukere. Selve appen er ikke endret i denne gjennomgangen.

## Grunnlaget for vurderingen

Jeg har lest skjermkomponenter, skjemaer, navigasjon og styringen av brukerflytene. I en lokal nettleser på 390 × 844 piksler har jeg gått gjennom hovedfanene, dokument- og innstillingssidene, oppstart i testmodus, fangstregistrering og et simulert fiskekortkjøp. Jeg har også åpnet etterregistrering og meldingsskjemaet. Avslutningsvarianter, rettelser, rapporteringsdøgn og enkelte feiltilstander er vurdert fra kode; disse er ikke alle kjørt gjennom manuelt.

32 skjermbilder ble tatt som arbeidsgrunnlag. Utvalgte bilder er vedlagt under [ux-audit-evidence](ux-audit-evidence/). Bildene viser dagens app. Next.js-merket nederst til venstre er utviklingsverktøy og inngår ikke i vurderingen av produktdesignet.

Ved denne mobilbredden målte hovedinnholdet omtrent 1 446 piksler på hjem, 1 908 på kart, 1 670 i fiskekortbutikken og 1 760 i regler. Dette er innholdshøyder, inkludert luft og bunnplass, ikke antall ord eller et problem i seg selv. Problemet er at viktige handlinger kommer etter sekundært innhold.

Et særlig tydelig eksempel: Etter at fisket starter, åpnes «Statistikk». Første skjermbilde viser personlige tall og kvoter. Den aktive turen og «Registrer fangst» ligger lenger ned. [Se skjermbildet](ux-audit-evidence/13-active.png).

## Prioritert liste

| Prioritet | Problem i dag                                                                                  | Anbefalt endring                                                          | Omfang        |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------- |
| 1         | Aktiv tur ligger under statistikk og kvoter                                                    | Åpne aktiv tur øverst; gjør «Registrer fangst» til hovedknapp             | Middels       |
| 1         | Hjem viser både mangler, etterregistrering, dokumenter, kvoter, meldinger, snarveier og regler | Situasjonsstyrt hjem med én tydelig hovedoppgave                          | Middels       |
| 1         | Fire oppstartssteg selv når sone og dokumenter er kjent                                        | Én samlet oppstartsside med sone, status og relevant regelbekreftelse     | Større        |
| 1         | Fangst krever egne sider for valg, detaljer, regelkontroll og kvittering                       | Samlet skjema med kontroll ved feltene og kort bekreftelse                | Middels       |
| 1         | Avslutningen spør om fangst uten å vise det som allerede er registrert                         | Vis registrerte fangster og spør bare om noe mangler                      | Middels       |
| 1         | GPS-, mottaks- og godkjenningsspråk går lenger enn funksjonen                                  | Bruk presise statuser og skill test, lokal lagring og faktisk bekreftelse | Liten–middels |
| 2         | Kjøp krever fem steg etter produktvalg                                                         | Samle kjøper/deltakere og samle bestillingskontroll/betaling              | Større        |
| 2         | Dokumenthandlinger kommer etter lange forklaringer                                             | Vis dokumentet eller registreringsknappen først                           | Liten         |
| 2         | Kart inneholder en ekstra produktkatalog                                                       | Kompakt sonepanel med én relevant handling                                | Middels       |
| 2         | Personlig historikk gjemmes under generell statistikk                                          | Gi «Mine turer» et tydelig sted i navigasjonen                            | Middels       |
| 3         | Mange kort, rammer, store overskrifter og gjentatte småtekster                                 | Et strammere visuelt system og kortere tekster                            | Middels       |

«Liten», «middels» og «større» er relative vurderinger av endringsomfang, ikke tidsestimater.

## Foreslått struktur

Jeg anbefaler å prøve **Hjem · Kart · Fiskekort · Mine turer · Mer** som hovednavigasjon.

Dette gir turer og fangst et synlig hjem. Regler beholdes lett tilgjengelig gjennom aktiv tur, valgt sone og «Mer». Det er en hypotese som må testes: Hvis brukere ofte åpner hele regelverket som en egen oppgave, bør den nåværende regelfanen beholdes og «Mine turer» heller få en tydelig inngang fra hjem. Det viktigste er at fangstregistrering aldri krever at brukeren tenker «statistikk».

| Sted       | Hovedoppgave              | Innhold som hører til                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------- |
| Hjem       | Hva skal jeg gjøre nå?    | Forberedelser, aktiv tur eller siste tur                               |
| Kart       | Hvor vil jeg fiske?       | Soner, posisjon, lokale forhold og kobling til kort                    |
| Fiskekort  | Finne eller vise kort     | «Mine kort» og «Kjøp kort», kortdetaljer og kvitteringer               |
| Mine turer | Registrere og finne turer | Turhistorikk, fangster, etterregistrering og egen statistikk           |
| Mer        | Sjeldnere oppgaver        | Dokumenter, regler, elvestatistikk, meldinger, profil og innstillinger |

Snarveier kan gjerne finnes flere steder. Men de må åpne samme skjerm, med samme muligheter og samme valgte sone/dato. En funksjon bør ha ett tydelig hovedsted.

## Skjerm for skjerm

### 1. Hjem: vis det som er relevant akkurat nå

**I dag:** Et stort statuskort etterfølges av etterregistrering, dokumentoversikt, eventuell kjøpsknapp, kvote, stor meldingsinngang, kart-/regelsnarveier og et regelkort. Førstegangsbrukeren møter «HANDLING KREVES – Dokumentasjon mangler» i et stort rødt felt. [Se hjem](ux-audit-evidence/18-home-loaded.png).

**Anbefaling:** Hjem får tre hovedtilstander:

- **Første gang / noe mangler:** «Gjør deg klar til å fiske», en kort oversikt over manglene og direkte handling på hver rad. Vis samlet fremdrift, men la brukeren velge rekkefølge. Gyldige dokumenter kan samles i «2 dokumenter registrert».
- **Klar for en ny tur:** Sone/kort i én kompakt rad, forståelig dokumentstatus, hovedknappen «Start fiske» og en diskret «Endre sone». Ikke vis hele dokumentlisten hver gang.
- **Under fiske:** Sone, starttid eller rolig varighet, tydelig «Registrer fangst», sekundær «Avslutt tur» og små innganger til dokumenter og regler. Eventuell stoppmelding får høyere prioritet enn vanlige handlinger.

Etter avslutning vises en kort oppsummering av siste tur og «Se turen». Den skal ikke bli en ny stor oppgave.

Flytt etterregistrering til «Mine turer», med en liten snarvei hjemme hvis testing viser at den brukes ofte. Flytt den generelle regelteksten til reglene. Gjør «Meld fra» til en liten, konsekvent tilgjengelig inngang; den store reklamelignende boksen trenger ikke stå på alle besøk.

Bruk et roligere uttrykk for uferdig oppsett. Faktiske stoppårsaker skal fortsatt være tydelige. Ikke erstatt manglende verifisering med en sterkere påstand om at fisket er godkjent.

### 2. Aktiv tur: handlingene må komme først

**I dag:** Etter oppstart sendes brukeren til «Statistikk». «Din statistikk», fire tallkort, artsfordeling og kvotefelt ligger foran aktiv tur. På hjem er handlingen i det aktive kortet avslutning; fangstregistreringen ligger et annet sted.

**Anbefaling:** Bruk samme aktive turkomponent på hjem og ved retur til appen. «Registrer fangst» skal være synlig uten rulling. Vis dagens fangster som korte rader under handlingene. Full historikk og sesongstatistikk åpnes separat.

Varighet er støtteinformasjon. En klokke med sekunder trenger ikke være skjermens største element. Bruk heller «Startet 17:20» og eventuelt «1 t 12 min».

Vis kvoter kort og relevant. Dersom en fangst innebærer at fisket må stanses, skal neste handling og årsaken være tydelig. Ikke bruk flere separate kvotekort til å formidle samme beskjed.

### 3. Start fiske: samle kontrollen

**I dag:** Status → posisjon → sone → regler. I den gjennomgåtte standardreisen innebærer dette å åpne flyten, bekrefte originaler, velge posisjonsmetode, bekrefte sone, krysse av for regler og starte – seks aktiveringer uten endring av sone eller utfylling.

**Anbefaling:** Én oppstartsside med:

- «Du starter i Sone 3» og «Endre».
- Kort status for dokumenter og tilgjengelige kontroller.
- Bare mangler, usikkerhet og relevante regelendringer utvidet.
- Eventuell nødvendig regel-/originalbekreftelse på samme side.
- «Start fiske» som siste handling.

Bruk gyldig kort eller sist valgte sone som forslag, men bekreft aktuell sone. Sone og dato må være avklart før endelig kontroll. Kontroller på nytt når sone endres og rett før start.

«Finn min sone» kan ligge ved sonefeltet. Spør om posisjon når brukeren velger denne funksjonen. Ved manglende tillatelse skal manuell sone fungere like godt. Ikke innfør enda et forklaringssteg foran nettleserens tillatelsesdialog.

Regelaksept kan knyttes til relevant sone og regelversjon der kravene tillater det. Faktiske krav til bekreftelser må avklares før de fjernes. Det er likevel mulig å samle nødvendige bekreftelser på én side.

Hvis et dokument mangler, åpnes riktig registrering direkte. Når brukeren lagrer, skal oppstarten fortsette med sone og valg bevart. Dagens flyt lukkes når flere slike avstikkere åpnes.

### 4. Registrer fangst: ett sammenhengende skjema

**I dag:** Art/resultat → størrelse/bilde/kommentar → omfattende regelkontroll → kvittering. Kontrollsiden gjentar størrelsesregler, minstemål og regelversjon også for en ordinær gjenutsatt fisk.

**Anbefaling:** Ett skjema med art, gjenutsatt/avlivet, lengde og vekt. Vis sone og fangsttid ferdig utfylt i en kompakt, redigerbar rad. Bilde og kommentar ligger under «Legg til bilde eller kommentar».

Appen kan kontrollere feltene fortløpende. En vanlig fangst trenger en kort tilbakemelding, ikke en egen side om hvilke beregninger som er gjort. Samle inn bare målinger som faktisk kreves; ikke fjern dagens påkrevde målinger før rapporteringskravene er avklart.

Ved regelavvik vises en tydelig forklaring nær det aktuelle feltet. Behold muligheten til å registrere det som faktisk skjedde. Feil i opplysninger må kunne rettes, men brukeren skal ikke presses til å velge et uriktig resultat for å komme videre.

En kompakt oppsummering rett over «Registrer fangst» gjør dataene reviewbare uten et nytt skjermsteg. Etter vellykket registrering: kort bekreftelse og tilbake til aktiv tur. «Registrer en til» kan være sekundært tilgjengelig. Vis bare kvoteinformasjon som hjelper med neste handling.

Kvitteringen må skille «Lagret på denne enheten», «Venter på sending» og «Mottatt» når løsningen får ekstern rapportering. Prototypen bør ikke påstå faktisk innsending når den bare lagrer lokalt.

### 5. Avslutt tur: bruk fangstene som allerede finnes

**I dag:** «Fikk du fangst?» med «Nei, registrer nullfangst» og «Ja, registrer manglende fangst». Skjermen mottar ikke turens registrerte fangster. Det gir ingen klar vei for «Ja, og jeg har allerede registrert alt».

**Anbefaling:** Vis «Du har registrert 1 fangst» og hovedknappen «Avslutt tur». Legg «Legg til en manglende fangst» under. Hvis ingen fangster er registrert: «Avslutt uten fangst» og alternativet «Registrer fangst».

Når en manglende fangst er lagt til, gå tilbake til avslutningsoversikten. Brukeren må kunne legge til flere før turen avsluttes. Vis en kort ferdigmelding og oppdatert turhistorikk.

Dette er også et datakvalitetspunkt: Dagens avslutning uten ny fangst oppretter et øktresultat med teksten «Nullfangst registrert», selv om tidligere fangster kan ligge lagret separat. Resultatet bør avledes fra turens faktiske fangster.

### 6. Etterregistrer tur: unngå å gjøre en enkel tur til en kontrollrapport

**I dag:** Turdetaljer → eventuelle fangster → historisk regelkontroll → bekreftelse. Fremdriftsvisningen har fire trinn også når fangsttrinnet hoppes over. Gjennomgangen viser mange kontroller, blant annet informasjon som ikke kan verifiseres. En fangst som må endres, fjernes og registreres på nytt.

**Anbefaling:** Start med dato, fra/til og sone. «Legg til fangst» utvider turen med redigerbare fangstrader. Nullfangstturen kan lagres fra samme side. Flere fangster vises i en kompakt liste med «Endre» og «Fjern».

Gi ett relevant varsel om sen registrering eller mulig avvik, og la «Se kontroller» åpne bakgrunnen. Behold faktisk tur- og fangsttid. Unngå at «i går kl. 17–19» fremstår som kjente fakta; foreslåtte tider må være tydelige forslag og enkle å endre.

### 7. Kart: hjelpe med sted, ikke gjenta butikken

**I dag:** Kart, sonetaster, kartets eget informasjonspanel, posisjonsknapp, enda et sonepanel, sesong/omfang, komplette fiskekortoppføringer med kilder og to store handlinger. [Se kart](ux-audit-evidence/02-map.png).

**Anbefaling:** Ett kart med ett kompakt sonepanel. Vis sone, sesong eller relevant stengning og én situasjonsbestemt hovedhandling: «Velg denne sonen» eller «Se fiskekort». Bruk en sekundær lenke for detaljer.

Flytt hele produktlisten til fiskekortbutikken, ferdig filtrert på sonen. Behold bare et kort pris-/tilgjengelighetssammendrag på kartet når datagrunnlaget støtter det. Vis ikke både kartpopup og et stort panel med samme informasjon.

Knappen «Bruk sone» starter i dag oppstartsflyten. Skill det å utforske/velge en sone fra det å starte fiske, eller kall knappen «Start fiske her» hvis det faktisk er handlingen. Ved aktiv tur må utforsking av kartet ikke utilsiktet endre den aktive turens sone.

### 8. Fiskekortoversikt og produktdetaljer

**I dag:** Fanen «Fiskekort» åpner butikken. Kort brukeren eier ligger under «Mer» eller dokumentene. Hvert salgsprodukt viser mange metadata. Produktdetaljen har skjematisk kart, kalender, faktaliste, utstyr, krav, rapportering, selger og kilde før fortsettknappen. [Se produktdetalj](ux-audit-evidence/26-product.png).

**Anbefaling:** Samle «Mine kort» og «Kjøp kort» under Fiskekort. Hvis brukeren har et aktuelt kort, vis det først. Hvis ingen kort finnes, gi én tydelig inngang til kjøp.

Produktlisten bør primært vise navn, område, korttype, pris og relevant tilgjengelighet. Flytt lange noter, kildekontroll, kapasitetstekst og bakgrunn til detaljer. Vesentlige kjøpsbegrensninger skal fortsatt være synlige før brukeren velger.

På produktdetaljen: navn, område, pris, gyldighet, datovalg og hovedhandling først. «Vilkår og regler», «Om området» og «Selger» kan åpnes ved behov. Plasser kjøpshandlingen tilgjengelig nederst i visningen uten at den dekker tekst eller felt.

Kort som kjøpes hos selger får «Kontakt selger» direkte. Ikke la dem se ut som en vanlig kjøpsflyt som først stopper etter flere steg. Rapporteringsdøgn bør være en handling på relevant sesongkort; funksjonen beholdes, men trenger ikke fremstå som et nytt produkt brukeren må oppdage.

### 9. Kjøp og betaling

**I dag:** Fem trinn etter produktvalget: kjøper, krav/deltakere, kontroll, betaling, kvittering. Kjøperopplysninger starter tomme. Dato endres på produktsiden, utenfor skjemaet. Tre avkrysninger kommer i tillegg til fortsettknappene. Testbetaling forklares flere ganger på samme skjerm. [Se betaling](ux-audit-evidence/30-payment.png).

**Anbefaling:** Etter produkt- og datovalg:

1. **Hvem skal fiske?** Gjenbruk tilgjengelige, bekreftede profilopplysninger. La brukeren endre dem. Medfiskere vises bare for relevante kort.
2. **Kontroller og betal.** Vis kort, område, gyldighet, deltakere, totalpris og nødvendige samtykker sammen. Rediger dato og opplysninger uten å miste resten. Én tydelig betalingshandling.
3. **Kortet ditt.** Kort og gyldighet først; kvitteringsdetaljer og referanser kan åpnes. Vis neste nødvendige forberedelse hvis noe mangler.

En ekstern betalingsleverandør kan tilføre egne steg. Målet gjelder appens egen del. Behold eksplisitt godkjenning av betaling, nødvendige vilkår og tydelig totalpris. Vis vesentlige gebyrer; en ekstra rad om et gebyr på 0 kr er normalt ikke nødvendig.

Dato og utfylte felt må overleve at brukeren går tilbake, åpner vilkår eller får betalingsfeil. Dagens kjøpsskjema opprettes på nytt etter retur til produktvisningen, noe som kan gi ny utfylling. Ved feil: fortell om betaling ble gjennomført og om kortet ble utstedt. «Prøv igjen» skal ikke skape usikkerhet om dobbeltkjøp.

### 10. Dokumenter, desinfisering og fiskeravgift

**I dag:** Dokumentvisningene har veiledning, lenker, lokal-/teststatus og personverntekst før handlingene. Desinfisering begynner i tillegg med en stor forklaring på en planlagt godkjenningsflyt. Registreringsknappen kommer nedenfor første mobilskjerm. [Se desinfisering](ux-audit-evidence/21-disinfection.png).

**Anbefaling:** Vis status, dokument og «Legg til»/«Endre» først. Deretter en kort og sann forklaring av verifiseringsstatus. Flytt lengre veiledning til «Slik fungerer det» og full lagringsinformasjon til «Om lagring og personvern», med en tydelig korttekst ved innsamling.

Fyll inn kjent navn og relevant år automatisk. Vis betalingsdato bare når avgift er valgt; ved fritak vises relevante fritaksfelt. Senere besøk i et annet vassdrag kan spørres som et forståelig spørsmål som åpner dato ved behov. Ikke gjem opplysninger som faktisk påvirker dokumentets gyldighet.

Skill «Vis dokumenter ved kontroll» fra «Administrer dokumenter». Under kontroll skal brukeren kunne vise aktuelle dokumenter raskt, med gyldighet og originalvedlegg. Redigering, sletting og lange hjelpetekster kommer i administrasjonsvisningen.

Bestem én konsekvent regel for eksterne fiskekort: Dagens «Mine fiskekort» sier at manuell opprettelse ikke er mulig, mens dokumentmappen kan åpne manuell registrering av samme dokumenttype. Hvis eksterne kort støttes, kall handlingen «Legg til kort kjøpt et annet sted» og merk det som egenregistrert. Hvis de ikke støttes, må ingen annen inngang tilby det.

### 11. Regler og varsler

**I dag:** Personlige regler, generell introduksjon, regelversjon, kildekontroll, to store meldinger, ti regelkategorier og kilder. Sesongkvoter er åpne som standard. Klokkens røde prikk vises uavhengig av om noe er nytt.

**Anbefaling:** Start med «Viktig for din sone»: sesong/stengning, fangstbegrensning og rapportering i kort form. Under dette ligger regelkategoriene sammenfoldet. En endring som faktisk gjelder brukerens dato/sone kan vises fremhevet. Eldre eller irrelevante meldinger ligger i arkiv/detaljer.

Flytt kontroll- og versjonsmetadata til en kompakt «Oppdatert … · Kilder». Hele regelverket beholdes. Ikke gjør en kort oppsummering til en erstatning for fullstendige regler.

Personlige regler må bygge på faktisk kort og sone. I dag hentes deler av «Tilpasset ditt fiskekort» fra mockinnhold, inkludert korttype og utløpstid. Vis et ærlig sonevalg eller en generell visning når personalisering ikke er mulig.

Skill mellom aktuelle meldinger og innstillinger for varsler. Rød prikk brukes bare for noe nytt/relevant. Varselklokken bør ha en konsekvent plassering; i dag avhenger den av om skjermen har en undertittel.

### 12. Historikk og statistikk

**I dag:** Elvestatistikk og personlig aktivitet er faner under «Statistikk». Egen visning begynner med statistikk også uten data. Fangster og turer har hver sin liste, med flere separate tomtilstander.

**Anbefaling:** «Mine turer» viser en kronologisk turliste med dato, sone, varighet og fangstantall. Fangster ligger under turen. Behold en egen filtrering for «Alle fangster» for brukere som trenger den.

Egen statistikk åpnes fra en liten oppsummering. Uten data: én vennlig tomtilstand og «Registrer en tur», fremfor mange nuller og flere forklaringer. Elvestatistikk beholder sesongvalg og kilde, men får en egen inngang som ikke står i veien for aktivitet.

Turdetaljer skal la brukeren åpne en fangst direkte. Rapport-ID, registreringstid, korreksjonshistorikk og andre administrative detaljer kan ligge under «Rapportdetaljer». Rettelse må fortsatt bevare historikk og vise om den er lagret eller sendt.

### 13. Meld fra

**I dag:** Detaljer → kontroll → bekreftelse. Kategorier, beskrivelse, bilde og posisjon får mye plass. Kvitteringen prioriterer «Send en ny melding».

**Anbefaling:** Ett skjema med kategori og beskrivelse, samt små valg for bilde/posisjon. Eventuell nødvendig bekreftelse samles ved sendeknappen. Behold kort, relevant informasjon om at dette ikke er en akuttkanal.

Etterpå: «Ferdig» tilbake til stedet brukeren kom fra; «Send en ny melding» er sekundært. Posisjon må vise faktisk hentet sted eller tydelig testdata. Mottaksbekreftelse skal bare si «mottatt» når mottak faktisk er bekreftet.

### 14. Mer, profil og innstillinger

**I dag:** Flere overlappende dokument- og kjøpsinnganger, profil både som stort kort og menypunkt, lang forklaring under hver rad og testverktøy blant vanlige oppgaver.

**Anbefaling:** Grupper i «Dokumenter», «Informasjon og hjelp» og «Innstillinger». Fjern duplisert profilinngang. Bruk undertekst bare der navnet ikke forklarer funksjonen. Flytt testscenarioer og nullstilling av testkjøp til en egen utvikler-/testinngang.

Språk kan beholdes som et kompakt, lett synlig valg ved første besøk, og senere ligge i innstillinger. Ikke gjør det vanskelig for utenlandske fiskere å bytte språk.

Velg én lagringsmodell for innstillinger. I dag lagrer bryterne gjennom preferansekontrolleren, mens en ekstra «Lagre»-knapp bare endrer bekreftelsesteksten. Bruk automatisk lagring med kort tilbakemelding, eller faktisk samlet lagring med én knapp.

## Hvilken informasjon kan fjernes eller flyttes?

«Fjernes» nedenfor gjelder gjentatt presentasjon eller dekorasjon, ikke nødvendige funksjoner, dokumenter eller regeldata.

| Informasjon                                                  | Beslutning                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| «Steg 3 av 4» samtidig med en nummerert fremdriftslinje      | Behold høyst én fremdriftsvisning; ikke tell kvitteringen som brukerarbeid      |
| Regelkontroller som er bestått                               | Kort status; full liste under «Se kontroller»                                   |
| Aktuell stoppårsak, vesentlig avvik eller uavklart gyldighet | Synlig ved relevant handling                                                    |
| Samme regeloppsummering på hjem, oppstart, fangst og regler  | Behold der den påvirker et valg; fjern øvrige gjentakelser                      |
| Produktkatalog i kart                                        | Flytt til butikken med valgt sone bevart                                        |
| Rapport-ID, betalingsreferanse og full utstederinformasjon   | Kvittering/rapportdetaljer                                                      |
| Full personverntekst i hver dokumentvisning                  | Kort konteksttekst ved registrering, full forklaring i detaljer                 |
| Forklaring av planlagt stasjonsgodkjenning                   | Hjelp/testinformasjon inntil funksjonen finnes                                  |
| Flere advarsler om samme testbetaling                        | Én tydelig beskjed ved betalingshandlingen og tydelig testmerking av resultatet |
| Store tomme statistikkfelt                                   | Én tomtilstand frem til innhold finnes                                          |
| «Statusmotor», «prototypeutvalg», «historisk regelkontroll»  | Brukerord i ordinære oppgaver; tekniske begreper i testverktøy                  |
| Permanent rød varselprikk                                    | Fjern når det ikke finnes en ny relevant melding                                |

## Visuell retning: roligere uten å bli anonym

Behold den varme bakgrunnen og den mørkeblå identiteten. Serifoverskriftene kan beholdes på sidenivå hvis de er ønsket; appen trenger ikke miste særpreg for å bli enkel.

Det som bør endres er hvor mange elementer som konkurrerer:

- Én hovedoverskrift per skjerm og én tydelig hovedknapp i den aktuelle oppgaven.
- Bruk vanlige lister med skillelinjer for dokumenter og historikk. Ikke gi hver opplysning en egen ramme, skygge og bakgrunn.
- Reserver store fargede felt for aktiv tur og viktige beskjeder. En registrert opplysning trenger ofte bare ikon og tekst.
- Bruk normal setningsform fremfor mange store bokstaver, brede bokstavmellomrom og små overtitler.
- Reduser antall størrelser, hjørneradier og knappestiler. La «Tilbake» se lik ut i alle flyter.
- Skill støttetekst fra hovedtekst gjennom plassering og vekt, ikke ved å gjøre den svært liten. Behold lesbar kontrast.
- Behold store trykkflater, synlig fokus og felter som fungerer med mobilens tastatur. Ikke få plass til mer ved å krympe alt.
- Bruk fast handlingsfelt i lange skjemaer bare når det ikke dekker felt, feilmeldinger eller navigasjon. Midlertidige bekreftelser må heller ikke legge seg over neste knapp.
- La tilbakeknappen bevare valg og rulleposisjon. Bruk fulle sider til lange oppgaver og korte dialoger til korte avklaringer.

Et konkret mål for aktiv tur er at sone, «Registrer fangst» og «Avslutt tur» er synlige uten rulling på en vanlig mobil. Hjem trenger ikke få plass med alle funksjoner samtidig.

## Kortere brukerreiser

Tallene gjelder skjermtilstander i oppgaven. Antall tastetrykk, felt og eksterne betalingssteg kommer i tillegg. Forslagene er mål, ikke implementerte forbedringer.

| Reise                            | I dag                                          | Foreslått                                              |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Start, kjent sone og dokumenter  | 4 oppstartssider                               | 1 samlet side; ekstra visning bare ved reell avklaring |
| Ordinær fangst                   | 3 arbeidssteg + kvittering                     | 1 skjema + kort bekreftelse                            |
| Kjøp etter produkt/dato          | 4 arbeidssteg + kvittering                     | 2 arbeidssteg + kort/kvittering                        |
| Etterregistrer uten fangst       | Tur → kontroll → kvittering; indikator viser 4 | 1 turregistrering + bekreftelse                        |
| Etterregistrer med fangst        | Tur → fangst(er) → kontroll → kvittering       | Samlet tur med fangster, eventuelt 2 arbeidsflater     |
| Meld fra                         | Detaljer → kontroll → kvittering               | 1 skjema + bekreftelse                                 |
| Avslutt med registrerte fangster | Spørsmål om fangst / manglende fangst          | «1 fangst registrert» → «Avslutt tur»                  |

Førstegangsreisen bør være: **Finn sone/kort → kjøp eller legg til gyldig dokumentasjon → fullfør eventuelle mangler → start turen**. Det skal ikke være nødvendig å oppdage dokumentkrav flere ganger eller starte oppstartsveiviseren på nytt etter hvert dokument.

Den gjentatte reisen bør være: **Åpne appen → bekreft sone og start → registrer fangst ved behov → avslutt**.

## Uoverensstemmelser som bør rettes samtidig

Disse øker forståelsesarbeidet og kan ikke løses bare med mindre tekst:

1. **Posisjon i oppstart:** Begge knappene i `PositionStep` går bare til neste steg. `ZoneStep` sier likevel «Vi fant …» og beskriver brukerens posisjon. Aktiv tur viser også «GPS-sone bekreftet». Bruk «Valgt sone» når den er manuelt valgt; ekte posisjonsfunksjon finnes separat i kartet.
2. **Hjem og regler bruker delvis mockkontekst:** Hjemkortets sone kommer fra `riverStatus`, og personlige regler bruker mockopplysninger om sone/kort. Knytt disse til faktisk aktiv tur og dokumenter.
3. **Sonevalg under aktiv tur:** `useZone` setter både valgt sone og aktiv sesjonssone og åpner startflyten. Utforsking må skilles fra endring av pågående tur.
4. **Delsone ved oppstart:** Valget i `ZoneStep` er ikke koblet til lagret tilstand. Ikke be brukeren gjøre et valg som ikke blir med videre.
5. **Nullfangst ved avslutning:** Avslutningen bruker ikke eksisterende fangster til å bestemme øktresultatet. Sammenstill turens data før den lagres som avsluttet.
6. **Rapporteringsdato:** Produktvisningen velger dato, mens `PermitReportingRegistration` starter på dagens dato. Valgt dato må følge med.
7. **Kjøp via forskjellige innganger:** Butikken kan åpnes som hovedfane eller detaljdialog. Oppfølgingsknapper for manglende dokumenter kobles ikke likt i disse variantene. Bruk én felles flyt.
8. **Fiskekortregistrering:** «Mine fiskekort» forbyr manuell opprettelse, mens dokumentmappen tillater den. Samordne policy og tekst.
9. **Melding og fangstrapport:** Meldingsflyten simulerer innsending uten faktisk mottakerbekreftelse; fangst lagres lokalt. Kvitteringene bruker likevel «sendt»/«mottatt». Vis faktisk status.
10. **Innstillinger:** Ekstra lagreknapper følger ikke den faktiske løpende lagringen. Fjern dobbeltmodellen.

## Anbefalt gjennomføringsrekkefølge

**Først:** Flytt aktiv tur og fangstknapp øverst. Gjør hjem situasjonsstyrt. Flytt lange dokumentforklaringer under handlingene. Rett misvisende posisjons- og mottakstekster, og la avslutningen bruke registrerte fangster.

**Deretter:** Samle oppstart og fangstskjema. Sikre retur fra dokumentregistrering, bevaring av valg og tydelig håndtering av mangler. Samordne dokument- og fiskekortinngangene.

**Så:** Forenkle kjøp, kart og etterregistrering. Prøv navigasjon med «Mine turer». Rydd regler, historikk og statistikk etter den valgte strukturen.

**Til slutt:** Samordne tekst, typografi, kort, knapper og bekreftelser. Visuell opprydding bør følge den nye informasjonsrekkefølgen, slik at man ikke polerer skjermer som snart skal slås sammen.

## Slik kontrollerer vi at det faktisk ble enklere

Prøv dagens og foreslått løsning med både førstegangsbrukere og erfarne fiskere. Et lite første forsøk kan bruke fem personer; dette gir konkrete observasjoner, ikke statistisk sikre konklusjoner.

Oppgavene bør omfatte å finne et passende kort, rette én dokumentmangel og fortsette oppstart, starte med kjent sone, registrere fangst, avslutte med allerede registrert fangst, etterregistrere en tur og vise dokumenter ved kontroll. Test også manuell sone uten posisjonstilgang.

Mål fullføring uten hjelp, tid, feilvalg, retur tilbake og hvor ofte brukeren må lete eller rulle etter neste handling. Be dem forklare hva statusen betyr. Kortere tekst hjelper lite hvis «klar» blir misforstått som ekstern godkjenning.

Akseptansekriterier for neste versjon:

- Aktiv tur og fangstknapp er synlige uten rulling på mobil.
- Kjent sone og dokumenter krever høyst én samlet oppstartsside i normaltilfellet.
- Dokumentregistrering sender brukeren tilbake til riktig sted med valg bevart.
- Normal fangst kan registreres fra ett sammenhengende skjema.
- Avslutning gjenbruker registrerte fangster og tillater flere manglende fangster.
- Dato, sone og kjøperfelt beholdes gjennom redigering og feil.
- Samme funksjon gir samme muligheter uansett inngang.
- Viktige avvik er synlige; beståtte kontroller og administrative detaljer tar mindre plass.
- Ingen påstand om posisjon, verifisering eller mottak går lenger enn det appen vet.

## Kodegrunnlag

Hovedobservasjonene kan spores til:

- `components/layout/easy-fisk-app.tsx`, `bottom-navigation.tsx` og `components/ui/screen-header.tsx` – hovedskjermer, kontekst og varsler.
- `features/home/home-screen.tsx` og `features/home/components/` – rekkefølge og informasjonsmengde hjemme.
- `features/fishing-session/fishing-flow.tsx` og `fishing-flow/steps/` – oppstartssekvens, posisjon, sone og bekreftelser.
- `features/statistics/statistics-screen.tsx`, `personal-statistics-panel.tsx` og `features/fishing-session/fishing-activity-screen.tsx` – plassering av aktiv tur og historikk.
- `features/catch-report/`, `features/history/` og `application/easy-fisk/use-easy-fisk-controller.ts` – fangst, etterregistrering og avslutning.
- `features/map/map-screen.tsx`, `features/rules/` og `features/fishing-permits/` – kart, regler og kortreisen.
- `features/documents/`, `features/profile/`, `domain/documents/document-fields.ts` og `features/feedback/` – dokumenter, skjemaer, innstillinger og meldinger.
- `styles/foundations.css`, `mobile-shell.css` og `responsive.css` – visuelt hierarki og mobilrammer.
