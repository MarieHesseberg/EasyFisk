import type { DocumentField, DocumentKind } from "./fishing-document.ts";

export interface DocumentFieldDefinition {
  key: DocumentField;
  label: string;
  type?: "date" | "datetime-local" | "number";
  required?: boolean;
  options?: string[];
}

const holder: DocumentFieldDefinition = {
  key: "holder",
  label: "Navn på fiskeren",
  required: true,
};
const reference: DocumentFieldDefinition = {
  key: "reference",
  label: "Kort-/kvitteringsnummer (hvis oppgitt)",
};

export const documentFields: Record<DocumentKind, DocumentFieldDefinition[]> = {
  permit: [
    holder,
    reference,
    { key: "issuer", label: "Utsteder / selger", required: true },
    {
      key: "category",
      label: "Korttype",
      required: true,
      options: ["Døgnkort", "Ukekort", "Sesongkort", "Gruppekort", "Annet"],
    },
    { key: "area", label: "Vassdrag, sone og eventuell delsone", required: true },
    { key: "startsAt", label: "Gyldig fra (norsk tid)", type: "datetime-local", required: true },
    { key: "endsAt", label: "Gyldig til (norsk tid)", type: "datetime-local", required: true },
    { key: "reportNumber", label: "Personlig rapporteringsnummer (hvis oppgitt)" },
  ],
  disinfection: [
    holder,
    reference,
    { key: "issuer", label: "Stasjon / hvem som utførte desinfiseringen", required: true },
    { key: "performedAt", label: "Utført (norsk tid)", type: "datetime-local", required: true },
    { key: "equipment", label: "Utstyr som ble desinfisert", required: true },
    {
      key: "otherRiverAt",
      label: "Senere besøk i annet vassdrag (norsk tid, valgfritt)",
      type: "datetime-local",
    },
  ],
  fee: [
    holder,
    reference,
    { key: "year", label: "Kalenderår", type: "number", required: true },
    {
      key: "category",
      label: "Avgift / fritak",
      required: true,
      options: ["Enkeltperson", "Familie", "Under 18 år – fritak", "Dispensasjon"],
    },
    { key: "paidAt", label: "Betalingsdato (ikke nødvendig ved fritak)", type: "date" },
  ],
};
