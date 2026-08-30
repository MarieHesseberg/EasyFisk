export type FishSpecies = "Laks" | "Sjøørret" | "Annen art";
export type CatchOutcome = "Gjenutsatt" | "Avlivet";

export const fishSpeciesOptions: readonly FishSpecies[] = ["Laks", "Sjøørret", "Annen art"];
export const catchOutcomeOptions: readonly CatchOutcome[] = ["Gjenutsatt", "Avlivet"];

export type CatchRecord = {
  id: string;
  caughtAt: number;
  submittedAt: number;
  sessionStart: number;
  species: FishSpecies;
  result: CatchOutcome;
  length: number;
  weight: number;
  zone: string;
  violation: boolean;
  late: boolean;
  imageName?: string;
  imageId?: string;
  imageData?: string;
  comment?: string;
  correction?: string;
};
