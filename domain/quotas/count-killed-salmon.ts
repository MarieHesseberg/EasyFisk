import type { CatchRecord } from "@/domain/models";

export function countKilledSalmon(catches: CatchRecord[]) {
  return catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length;
}
