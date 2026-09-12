import type { DocumentKind } from "@/domain/documents/fishing-document";

export const documentGuidance: Record<DocumentKind, { text: string; url: string; link: string }> = {
  permit: {
    text: "Her vises fiskekort som er utstedt gjennom kjøpsflyten i EasyFisk. Sesongkort kan også kreve et eget rapporteringskort for hvert fiskedøgn.",
    url: "https://lakseelver.no/nb/elver/mandalselva/about",
    link: "Les Mandalselvas regler for fiskekort",
  },
  disinfection: {
    text: "En desinfektør kan godkjenne utført behandling direkte i appen. Fiskeren kan også legge inn et eksisterende stemplet bevis manuelt. Desinfisering gjelder normalt i 20 dager, men blir ugyldig etter bruk i et annet vassdrag.",
    url: "https://lakseelver.no/nb/elver/mandalselva/about",
    link: "Se krav og steder for desinfisering",
  },
  fee: {
    text: "Statlig fiskeravgift gjelder kalenderåret og er ikke et lokalt fiskekort. Registrer kvitteringen og fiskeren den dekker, også ved familieavgift. Under 18 år er man fritatt; eventuell dispensasjon må kunne dokumenteres. Ikke legg inn fødselsnummer eller betalingskortinformasjon.",
    url: "https://fiskeravgift.miljodirektoratet.no/",
    link: "Betal fiskeravgift eller hent kvittering hos Miljødirektoratet",
  },
};
