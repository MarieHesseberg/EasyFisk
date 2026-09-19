# Prøv EasyFisk 🎣

EasyFisk skal gjøre det enklere å fiske i Mandalselva. Appen samler fiskekort,
dokumenter, regler, kart, fiskeøkter og fangster, så du får oversikt før, under og etter turen.

**[Åpne appen her](https://mariehesseberg.github.io/EasyFisk/)** – prøv gjerne på mobilen.
Du trenger ikke være fisker for å hjelpe til!

## Ting du kan prøve

- Se deg rundt på hjemskjermen, i kartet og i fiskereglene. Finner du det du forventer?
- Kjøp et testfiskekort og finn det igjen under «Mine fiskekort».
- Prøv å registrere fiskekort, desinfisering og fiskeravgift under «Mer».
- Start en fiskeøkt, velg sone, registrer en fangst og avslutt økten. Prøv også en tur uten fangst.
- Etterregistrer en tidligere tur, og se etter økter og fangster i historikken og statistikken.

## Hva er statusmotoren?

Statusmotoren er appens sjekk før du starter å fiske. Den bruker registrerte dokumenter
og fangster til å vise om du er klar, om noe mangler, eller om en kvote er nådd.
Grønt betyr klart, gult betyr at noe må vurderes, og rødt stopper oppstart.

Under **Mer → Statusmotor** kan du teste ulike situasjoner. Velg for eksempel
«Alt er i orden (oppstart tillatt)», «Fiskekort mangler» eller «Døgnkvoten er nådd»,
og trykk på knappen for å aktivere testsituasjonen. Prøv deretter å starte en økt
og se om forklaringen gir mening. Registrerte, gyldige dokumenter kan dekke mangler
også i testmodus. Trykk «Avslutt testmodus og bruk mine data» for å gå tilbake.

## Skriv gjerne ned det du legger merke til

Alt som kan forbedres er nyttig: uklare tekster, knapper som ikke virker, noe som
er vanskelig å finne, eller funksjoner du savner. Noter gjerne **hva du prøvde å gjøre,
hva som skjedde, og hva du forventet**. Et skjermbilde hjelper også. Send notatene til meg!

Dette er en prototype: kjøp og betaling er simulert, ingen penger trekkes, og rapporter
sendes ikke til elveeigarlaget. Testkort er ikke gyldige fiskekort. Det du registrerer,
lagres lokalt i nettleseren du bruker.

_For utvikling og teknisk oppsett, se [utviklerveiledningen](DEVELOPMENT.md)._

[Min prosjektlogg](PROSJEKTLOGG.md) viser hvordan EasyFisk har utviklet seg, og hvorfor vi har gjort de større endringene.

## Slett data og start på nytt

Under **Mer → Slett og tilbakestill** kan du slette fisketurer og fangster, dokumenter og kortkjøp, innmeldinger, profil, innstillinger eller kladder. Velg **Alt – start med en tom app** for full tilbakestilling. Slettingen må bekreftes. Bilder, vedlegg, tildelte tilganger, aktive turer og kladder omfattes også. Kart og regelinformasjon beholdes.

Varselbjella husker leste varsler. Den røde prikken kommer tilbake ved nye varsler. Eksempelvarsler om fiktive kort vises ikke.

Statusmotorens valg forhåndsvises før du aktiverer dem. GPS bruker den vanlige sonevelgeren, og testsituasjoner kan ikke avslutte en pågående fisketur.
