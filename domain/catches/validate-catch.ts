import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
import type { CatchOutcome, FishSpecies } from "./catch";

export type CatchValidation = {
  detailsValid: boolean;
  regulatedSpecies: boolean;
  tooSmall: boolean;
  largeSalmon: boolean;
  tooLarge: boolean;
  blocked: boolean;
  ruleTitle: string;
  ruleText: string;
};

export function parseMeasurement(value: string) {
  return Number(value.replace(",", "."));
}

export function validateCatch(
  species: FishSpecies,
  result: CatchOutcome,
  length: number,
  weight: number,
): CatchValidation {
  const { catchSize, metadata } = activeFishingRules;
  const detailsValid = length > 0 && weight > 0;
  const regulatedSpecies = species === "Laks" || species === "Sjøørret";
  const killed = result === "Avlivet";
  const tooSmall = killed && regulatedSpecies && length < catchSize.minimumCm;
  const largeSalmon =
    killed &&
    species === "Laks" &&
    length > catchSize.regularSalmonMaximumCm &&
    length <= catchSize.largeSalmonMaximumCm;
  const tooLarge = killed && species === "Laks" && length > catchSize.largeSalmonMaximumCm;
  const blocked = tooSmall || tooLarge;

  const ruleTitle = tooSmall
    ? `${species} under ${catchSize.minimumCm} cm skulle vært gjenutsatt`
    : tooLarge
      ? `Laks over ${catchSize.largeSalmonMaximumCm} cm kan ikke avlives`
      : largeSalmon
        ? "Bruker sesongens storlaks-unntak"
        : "Valgene er innenfor størrelsesreglene";

  const ruleText = tooSmall
    ? `Minstemålet for laks og sjøørret er ${catchSize.minimumCm} cm. Denne ${species.toLowerCase()}en er ${length} cm og skulle vært gjenutsatt. Registrer likevel det som faktisk skjedde. Rapporten merkes som et mulig regelbrudd.`
    : tooLarge
      ? `Fra ${metadata.shortVersionLabel} kan bare én laks på opptil ${catchSize.largeSalmonMaximumCm} cm avlives. Denne laksen er ${length} cm. Registrer det som faktisk skjedde; rapporten merkes som et mulig regelbrudd.`
      : largeSalmon
        ? `Fra ${metadata.shortVersionLabel} kan én av sesongens avlivede laks være opptil ${catchSize.largeSalmonMaximumCm} cm. Unntaket er tilgjengelig og blir brukt ved innsending. De øvrige må være under ${catchSize.regularSalmonMaximumCm} cm.`
        : killed && regulatedSpecies
          ? `${species} på ${length} cm er innenfor gjeldende størrelsesregel. Døgn- og sesongkvoten oppdateres ved innsending.`
          : `${species} på ${length} cm registreres som gjenutsatt og bruker ikke avlivingskvoten.`;

  return {
    detailsValid,
    regulatedSpecies,
    tooSmall,
    largeSalmon,
    tooLarge,
    blocked,
    ruleTitle,
    ruleText,
  };
}
