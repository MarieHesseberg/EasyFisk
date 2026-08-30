import type { DocumentKind } from "@/domain/documents/fishing-document";

export const documentGuidance: Record<DocumentKind, { text: string; url: string; link: string }> = {
  permit: {
    text: "Kopier opplysningene fra fiskekortet. Tidsrom og område varierer mellom kortene. Sesongkort krever også egne rapporteringskort for fiskedøgn; gruppekort krever personlig rapporteringsnummer. Registreringen her kjøper eller utsteder ikke fiskekort.",
    url: "https://lakseelver.no/nb/elver/mandalselva/about",
    link: "Les Mandalselvas regler for fiskekort",
  },
  disinfection: {
    text: "Registrer faktisk utført desinfisering fra stemplet fiskekort eller oblat. I Mandalselva gjelder den i 20 dager, med mindre du besøker et annet vassdrag. Registreringen i appen utfører eller godkjenner ikke desinfisering.",
    url: "https://lakseelver.no/nb/elver/mandalselva/about",
    link: "Se krav og steder for desinfisering",
  },
  fee: {
    text: "Statlig fiskeravgift gjelder kalenderåret og er ikke et lokalt fiskekort. Registrer kvitteringen og fiskeren den dekker, også ved familieavgift. Under 18 år er man fritatt; eventuell dispensasjon må kunne dokumenteres. Ikke legg inn fødselsnummer eller betalingskortinformasjon.",
    url: "https://fiskeravgift.miljodirektoratet.no/",
    link: "Betal fiskeravgift eller hent kvittering hos Miljødirektoratet",
  },
};
