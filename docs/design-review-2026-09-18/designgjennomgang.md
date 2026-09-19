# EasyFisk – designgjennomgang og tre stilforslag

Historisk designnotat fra 18. september 2026, arkivert her 19. september. Vurderingene under beskriver appen og forslagene på det tidspunktet, før det senere godkjente designet ble implementert. Se [prosjektloggen](../../PROSJEKTLOGG.md) for videre valg og gjennomføring.

## Vurdering

EasyFisk trenger et mer konsekvent visuelt hierarki. Den siste endringen gjorde «Mine fiskekort» større, men lot den inngå i en rekke store bokser som alle krever oppmerksomhet. Det løste størrelsen, men ikke helheten.

Anbefalt retning er A, klar elveblå: en videreutvikling av identiteten med mer nøytrale flater, mindre innramming og tydeligere prioritering. B er et godt alternativ dersom appen skal få et tydeligere naturpreg. C gir et strammere og mer nøytralt uttrykk.

## Hva gjennomgangen bygger på

Brukerens bilde, kildekoden for farger, typografi og komponenter, samt lokal nettleservisning på 390 × 844 av hjem, varsler, kjøpsoversikt, regler, profil/«Mer», kartkontroller og etterregistrering av tur. Skjermbilder ligger i `current/`. Utvalgte faktisk beregnede nettleserstiler ligger i `current/computed-styles.json`.

Kartbildet ble tatt før kartflisene var ferdig lastet og brukes derfor bare til vurdering av kontrollene. Dette er en designgjennomgang av sentrale skjermbilder, ikke en full funksjons- eller tilgjengelighetsrevisjon av alle tilstander. Innloggede, tomme, aktive og ferdige tilstander må gjennomgås samlet ved implementering.

## Konkrete funn og foreslåtte forbedringer

| Område              | Funn                                                                                                     | Foreslått løsning                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hjem                | Tre fylte knapper konkurrerer om oppmerksomheten inne i enda en stor flate.                              | La «Kjøp fiskekort» være hovedhandlingen i tilstanden før fisket. Dokumentregistrering blir tydelige rader med store trykkflater.                                     |
| Mine fiskekort      | Riktig funksjon og størrelse, men nok en tung ramme i en tett stabel.                                    | Behold tydelig plassering og stor trykkflate. Bruk én mild bakgrunn, ikon, tittel og pil; vis antall eller gyldighet som sekundær informasjon.                        |
| Andre handlinger    | Meld fra-kortet har gulbrun bakgrunn som kan tolkes som et varsel.                                       | Bruk vanlige handlingsrader. Reserver varselfarger for faktiske forhold som trenger oppmerksomhet.                                                                    |
| Farger              | Krem, blått, petrol og gult er fordelt på mange flater.                                                  | Én nøytral bakgrunn, én hovedfarge, mørk tekst og egne semantiske statusfarger. Flertallet av flater bør være nøytrale.                                               |
| Typografi           | Store overskrifter og mye halvfet tekst, men liten navigasjonstekst. Bunnmenyen ble målt til 9 px.       | Brødtekst 16–17 px, navigasjon 13–14 px, deloverskrift 20–22 px og sidetittel 28–30 px. Normal vekt på brødtekst, medium på handlinger og halvfet på overskrifter.    |
| Skrifttype          | Arial er gjennomgående, men mange lokale regler bestemmer størrelse og vekt.                             | Velg én skriftfamilie og en liten fast skala. Arial er ikke i seg selv problemet; ensartet bruk er viktigst. Inter, Source Sans 3 og systemfont er de tre retningene. |
| Former              | Mange hjørneradier, synlige rammer og skygger skaper variasjon uten tydelig formål.                      | To ordinære radier, eksempelvis 12 px for kontroller og 16 px for innholdsflater. Skillelinjer og avstand kan erstatte mange bokser.                                  |
| Toppfelt            | Språkknapp, varsler, logo og sidetittel tar mye plass.                                                   | Samme kompakte toppfelt overalt. Språk kan vises kort, men må ha tydelig tilgjengelig navn og stor trykkflate. Behold logo som hjemlenke.                             |
| Bunnmeny            | Liten tekst og kraftig skygge over innholdet. Valgt fane skiller seg hovedsakelig gjennom farge.         | Større etiketter, roligere skillelinje og valgt fane markert med både form/vekt og farge. Behold de fem kjente fanene i første omgang.                                |
| Kjøp                | Soneknapper, datofelt og produktkort har ulike uttrykk. Flere like kjøpsknapper kan oppleves tunge.      | Samme feltstil, samlet datovalg, synlig total og ett tydelig neste steg. Skill kjøper og fisker med radioalternativer og tekst.                                       |
| Regler              | Store fargede introduksjonskort og flere nivåer med overskrifter skyver selve reglene ned.               | Kort status for valgt sone, tydelig regelversjon og rolige utvidbare avsnitt. Vis varsel bare når situasjonen tilsier det.                                            |
| Skjemaer            | Etterregistrering viser små feltetiketter og flere visuelle lag i en dialog over en annen skjerm.        | Samme feltkomponenter overalt, synlige etiketter på minst 16 px, enkel fremdrift og én primærknapp. Lange skjemaer bør få en romslig egen flate.                      |
| Varsler             | Lesbar tekst er allerede forbedret; panelet har fortsatt en annen flate og skygge enn flere andre deler. | Samme typografi og flatesystem. Tydelig skille mellom ulest, lest og handling; rød markør bare når noe er ulest.                                                      |
| Profil og historikk | Flere veier til kjøp og kort gir en lang meny.                                                           | Grupper etter «Min profil», «Mine dokumenter» og «Historikk». Fjern unødvendige forklaringstekster der tittelen er tilstrekkelig.                                     |
| Kart                | Kartet trenger større sammenhengende plass enn et vanlig skjema.                                         | La kartet dominere, samle sone og kortvalg i et enkelt bunnpanel og bruk samme kontrollstil som resten. Vis faktisk posisjonsstatus tydelig.                          |

Teknisk ser jeg også flere lag med overstyrende stilark og mange nærliggende radiusverdier. En implementering bør samle grunnverdier og felles komponenter, slik at en endring faktisk slår likt ut på alle skjermer.

## Hva vi kan lære av etablerte apper

Referansene er store, relevante apper og deres egne publiserte eksempler. Dette er ikke en rangering av nedlastingstall, og bildene viser dokumenterte publiserte versjoner, ikke en påstand om identisk utseende i alle markeder i dag.

**Airbnb:** De offisielle bildene fra redesignet i 2025 bruker lyse, nøytrale flater, tydelig typografisk rekkefølge og en synlig markering av valgt kategori. Min vurdering er at EasyFisk bør hente den tydelige grupperingen og navigasjonen. De dekorative tredimensjonale ikonene og den store bildemengden er mindre relevante for et praktisk fiskeverktøy. [Offisielle appbilder og omtale](https://news.airbnb.com/airbnb-2025-summer-release/).

**AllTrails:** Den offisielle presentasjonen viser kart som hovedinnhold, lesbare informasjonspaneler og en gjenkjennelig grønn profil. For EasyFisk er lærdommen å la soner, gyldighet og handlinger dominere, med naturpreg gjennom en kontrollert fargebruk. Det er ikke nødvendig å fylle hjemskjermen med naturbilder. [Offisiell produktlansering](https://www.alltrails.com/press/alltrails-expands-membership-offering-with-alltrails-peak), [pressemelding med appbilder](https://www.prnewswire.com/news-releases/alltrails-expands-membership-offering-with-alltrails-peak-302451541.html).

**Vipps MobilePay:** De offisielle ressursene legger vekt på standardiserte merkevareelementer og betalingsknapper. Det er nyttig for EasyFisk ved betaling: den ordinære appen bør ha sitt eget rolige uttrykk, mens selve betalingshandlingen bør bruke en gjenkjennelig og korrekt Vipps-knapp. Dette er en vurdering av publiserte betalingskomponenter, ikke en full gjennomgang av Vipps-appen. [Designressurser](https://developer.vippsmobilepay.com/docs/knowledge-base/design-guidelines/).

Felles anbefaling for EasyFisk: færre konkurrerende elementer, gjentakbare komponenter og en synlig forskjell mellom hovedhandling, navigasjon og informasjon. Dette er mine designvalg basert på referansene.

## Tre retninger

| Retning           | Uttrykk                                                 | Farger                                                         | Foreslått skrift                          |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| A – Klar elveblå  | Rolig, presis og gjenkjennelig videreføring av EasyFisk | Petrol `#155E75`, nesten hvit `#F7F9FA`, mørk tekst `#172C36`  | Inter, med systemfont som reserve         |
| B – Nordisk natur | Varmere og mykere, med tydelig friluftspreg             | Skoggrønn `#205B48`, varm hvit `#FAFAF6`, mørk tekst `#1E2C25` | Source Sans 3, med systemfont som reserve |
| C – Presis og lys | Stram, nøytral og tydelig                               | Blå `#234DC3`, hvit `#FFFFFF`, koksgrå `#20242C`               | Plattformens systemfont                   |

Bildene viser samme eksempeltilstand og innhold, slik at valget først og fremst gjelder formspråk, farge og typografi. Hjem og kjøp vises sammen for hver retning. De er laget med innebygd imagegen; spesifikasjonene ligger i `prompts.md`. Logo og ikonformer i bildene er konseptuelle; eksisterende logo kan beholdes i implementeringen. Priser og datoer er eksempelinnhold, ikke nye regel- eller sesongbeslutninger.

## Enkelhet og universell utforming

En roligere app kan samtidig ha stor tekst og store trykkflater. Vi oppnår det ved å fjerne overflødige rammer og repetisjon, fremfor å krympe innholdet.

Foreslåtte dimensjoner er 48–56 px høye hovedkontroller og minst 48 × 48 px for små ikonhandlinger. Dette er vårt designmål. WCAG 2.2 AA har et minimumskriterium på 24 × 24 CSS-piksler, med definerte unntak og avstandsregler; 48 px er ikke et generelt WCAG-minimum. [W3C om målområder](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Vanlig tekst skal ha minst 4,5:1 kontrast, og stor tekst minst 3:1. De foreslåtte hovedkombinasjonene er beregnet fra eksakte fargekoder:

| Retning | Brødtekst mot bakgrunn | Sekundærtekst mot bakgrunn | Hvit tekst på hovedknapp |
| ------- | ---------------------: | -------------------------: | -----------------------: |
| A       |                13,71:1 |                     6,07:1 |                   7,27:1 |
| B       |                13,92:1 |                     5,94:1 |                   7,92:1 |
| C       |                15,55:1 |                     6,41:1 |                   7,19:1 |

Dette verifiserer bare disse fargeparene, ikke alle elementene i de genererte bildene eller en ferdig app. Feltrammer, fokus, status og kartmarkeringer må kontrolleres separat. [W3C om tekstkontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Ved implementering skal valgt dato, aktiv fane og status formidles med tekst eller symbol i tillegg til farge. Fokus må være synlig og ikke skjules av bunnmenyen. Tekstforstørrelse til 200 prosent, omflyting ved 320 CSS-pikslers bredde, tastatur og skjermleser må testes i de faktiske flytene. På mobil må høyde og bunnplass ta hensyn til nettleserfelt og skjermtastatur. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [omflyting](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [fokus som ikke skjules](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

## Etter at stil er valgt

Først etableres farger, skrift, avstand og felles knapper/felt. Deretter brukes samme system på hjem, kjøp, regler, kort, varsler, kart, rapportering og profil. Hjem må også tegnes for tom profil, kommende kort, klar til fiske og aktiv tur. Under aktiv tur prioriteres registrering og avslutning av fisket; kjøp forblir tilgjengelig som en sekundær handling.

Avslutt med kontroll på liten og stor mobilskjerm, norsk og engelsk, store tekstinnstillinger, betalingsflyt og rapportering. Endringen skal være konkret og gjennomgått før publisering. Ingen appkode er endret eller pushet i denne designrunden.
