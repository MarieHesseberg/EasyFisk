import type { CatchRecord } from "@/domain/catches/catch";

export function countKilledSalmon(catches: CatchRecord[]) {
  return catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length;
}
