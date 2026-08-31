import type {
  PrototypePermitProduct,
  PrototypePermitProductDetails,
} from "@/domain/fishing-permits/prototype-permit-product";

const commonDetails: PrototypePermitProductDetails = {
  ageRule:
    "Statlig fiskeravgift kreves fra fylte 18 år. Eventuelle lokale aldersvilkår må kontrolleres hos selger.",
  equipmentAndFacilities: [
    "Utstyr og fasiliteter er ikke spesifisert på den offentlige produktsiden.",
  ],
  reportingRule:
    "Fangst og nullfangst skal rapporteres. Sesongkort kan kreve en egen døgnregistrering før fisket starter.",
};

const detailsByProductId: Partial<Record<string, Partial<PrototypePermitProductDetails>>> = {
  "zone-1-boat-day": {
    equipmentAndFacilities: [
      "Kortet tillater inntil to stenger fra båt.",
      "Båtleie inngår ikke i fiskekortet.",
    ],
  },
  "zone-1-sandnes-day": {
    equipmentAndFacilities: ["Båt kan leies separat hos Sandnes Camping."],
  },
  "zone-2-fuskeland-group": {
    equipmentAndFacilities: [
      "Gruppekortet tillater inntil tre stenger.",
      "Alle medfiskere skal registreres med navn.",
    ],
  },
  "zone-2-holmegard-day": {
    equipmentAndFacilities: [
      "Enkel hytte ved elvebredden inngår.",
      "Gapahuk og grillhytte er oppgitt på produktsiden.",
    ],
  },
  "zone-2-holmegard-season": {
    equipmentAndFacilities: [
      "Enkel hytte ved elvebredden inngår.",
      "Gapahuk og grillhytte er oppgitt på produktsiden.",
    ],
    reportingRule:
      "Innehaveren må registrere et eget rapporteringskort for hvert fiskedøgn og rapportere fangst eller nullfangst.",
  },
  "zone-2-holmegard-reporting": {
    equipmentAndFacilities: [
      "Dette er en døgnregistrering, ikke et nytt fiskekort eller utstyrstilbud.",
    ],
    reportingRule:
      "Registreringen er obligatorisk for innehaver av Holmegård sesongkort og avsluttes med fangst eller nullfangst.",
  },
  "zone-3-day": {
    ageRule:
      "Barn og unge til og med 18 år fisker gratis i åpne soner, men skal fortsatt hente tillatelse. Statlig fiskeravgift kreves fra fylte 18 år.",
  },
  "zone-3-week": {
    ageRule:
      "Barn og unge til og med 18 år fisker gratis i åpne soner, men skal fortsatt hente tillatelse. Statlig fiskeravgift kreves fra fylte 18 år.",
  },
  "zone-3-season": {
    ageRule:
      "Barn og unge til og med 18 år fisker gratis i åpne soner, men skal fortsatt hente tillatelse. Statlig fiskeravgift kreves fra fylte 18 år.",
    reportingRule:
      "Sesongkortinnehaveren må hente en egen døgnregistrering for hvert fiskedøgn og rapportere fangst eller nullfangst.",
  },
};

export function getPrototypePermitProductDetails(
  product: PrototypePermitProduct,
): PrototypePermitProductDetails {
  const details = detailsByProductId[product.id];
  return {
    ...commonDetails,
    ...details,
    equipmentAndFacilities: details?.equipmentAndFacilities ?? commonDetails.equipmentAndFacilities,
  };
}
