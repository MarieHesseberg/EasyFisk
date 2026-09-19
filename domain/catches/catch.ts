export type FishSpecies = "Laks" | "Sjøørret" | "Annen art";
export type CatchOutcome = "Gjenutsatt" | "Avlivet";

export const fishSpeciesOptions: readonly FishSpecies[] = ["Laks", "Sjøørret", "Annen art"];
export const catchOutcomeOptions: readonly CatchOutcome[] = ["Gjenutsatt", "Avlivet"];

export type CatchRecord = {
  id: string;
  caughtAt: number;
  submittedAt: number;
  sessionStart: number;
  sessionId?: string;
  species: FishSpecies;
  result: CatchOutcome;
  length: number;
  weight: number;
  zone: string;
  zoneId?: import("../zones/zone").ZoneId;
  violation: boolean;
  late: boolean;
  imageName?: string;
  imageId?: string;
  imageData?: string;
  comment?: string;
  rulesVersion?: string;
  correction?: string;
  revisions?: { changedAt: number; before: CatchEditable; after: CatchEditable; reason: string }[];
};

export type CatchEditable = Pick<
  CatchRecord,
  "species" | "result" | "length" | "weight" | "comment"
>;
export type CatchEdit = { values: CatchEditable; reason: string };
