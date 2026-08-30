import type { DocumentReadiness } from "../documents/get-document-readiness.ts";
import { getStatusEngineDocumentReadiness } from "./get-status-engine-document-readiness.ts";
import type { DemoScenario, DemoStatus } from "./rule.ts";

export function resolveStatusEngine(
  actualReadiness: DocumentReadiness,
  selectedScenario: DemoScenario,
  isTestMode: boolean,
) {
  if (isTestMode) {
    return {
      readiness: getStatusEngineDocumentReadiness(selectedScenario.id),
      scenario: selectedScenario,
      status: selectedScenario.id,
    };
  }

  const status = getActualDocumentStatus(actualReadiness);
  return {
    readiness: actualReadiness,
    status,
    scenario: actualReadiness.complete
      ? {
          id: "ok" as const,
          label: "Faktisk status",
          title: "Du er klar til å fiske",
          detail: "Alle dokumentkrav er registrert og gyldige i appen.",
          level: "ok" as const,
        }
      : {
          id: status,
          label: "Faktisk status",
          title: "Dokumentasjon mangler",
          detail: `Registrer ${actualReadiness.missingLabels.join(", ")} før du starter.`,
          level: "blocked" as const,
          action: "Registrer dokumentasjon",
        },
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
