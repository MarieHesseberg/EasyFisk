import type { DocumentReadiness } from "../documents/get-document-readiness.ts";
import { getStatusEngineDocumentReadiness } from "./get-status-engine-document-readiness.ts";
import type { DemoScenario, DemoStatus } from "./rule.ts";

const documentStatuses = new Set<DemoStatus>([
  "allMissing",
  "noPermit",
  "wrongZone",
  "expiredDisinfection",
  "otherRiver",
  "noFee",
]);

const documentLabels = {
  permit: "gyldig fiskekort",
  disinfection: "gyldig desinfisering",
  fee: "fiskeravgift eller registrert fritak",
};

export function resolveStatusEngine(
  actualReadiness: DocumentReadiness,
  selectedScenario: DemoScenario,
  isTestMode: boolean,
) {
  if (isTestMode) {
    const simulated = getStatusEngineDocumentReadiness(selectedScenario.id);
    const readiness = mergeDocumentReadiness(simulated, actualReadiness);
    if (documentStatuses.has(selectedScenario.id)) {
      const status = getActualDocumentStatus(readiness);
      return {
        readiness,
        status,
        scenario: createDocumentScenario(readiness, status, "Testsituasjon"),
      };
    }
    return {
      readiness,
      scenario: selectedScenario,
      status: selectedScenario.id,
    };
  }

  const status = getActualDocumentStatus(actualReadiness);
  return {
    readiness: actualReadiness,
    status,
    scenario: createDocumentScenario(actualReadiness, status, "Faktisk status"),
  };
}

function mergeDocumentReadiness(
  simulated: DocumentReadiness,
  actual: DocumentReadiness,
): DocumentReadiness {
  const valid = {
    permit: simulated.valid.permit || actual.valid.permit,
    disinfection: simulated.valid.disinfection || actual.valid.disinfection,
    fee: simulated.valid.fee || actual.valid.fee,
  };
  const missingLabels = (Object.keys(valid) as (keyof typeof valid)[])
    .filter((kind) => !valid[kind])
    .map((kind) => documentLabels[kind]);
  return { complete: missingLabels.length === 0, valid, missingLabels };
}

function createDocumentScenario(
  readiness: DocumentReadiness,
  status: DemoStatus,
  label: string,
): DemoScenario {
  return readiness.complete
    ? {
        id: "ok",
        label,
        title: "Du er klar til å fiske",
        detail: "Alle dokumentkrav er registrert og gyldige i appen.",
        level: "ok",
      }
    : {
        id: status,
        label,
        title: "Dokumentasjon mangler",
        detail: `Registrer ${readiness.missingLabels.join(", ")} før du starter.`,
        level: "blocked",
        action: "Registrer dokumentasjon",
      };
}

function getActualDocumentStatus(readiness: DocumentReadiness): DemoStatus {
  const missing = Object.entries(readiness.valid)
    .filter(([, valid]) => !valid)
    .map(([kind]) => kind);
  if (missing.length === 3) return "allMissing";
  if (missing.includes("permit")) return "noPermit";
  if (missing.includes("disinfection")) return "expiredDisinfection";
  if (missing.includes("fee")) return "noFee";
  return "ok";
}
