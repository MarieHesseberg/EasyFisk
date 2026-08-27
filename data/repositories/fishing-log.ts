import { createMemoryFishingLogRepository } from "@/data/memory/create-memory-fishing-log-repository";
import { createLocalStorageFishingLogRepository } from "@/data/local-storage/create-local-storage-fishing-log-repository";

/** Nettleseren bruker varig prototypelagring; server og tester kan bruke minneadapteren. */
export const fishingLogRepository =
  typeof window === "undefined"
    ? createMemoryFishingLogRepository()
    : createLocalStorageFishingLogRepository(window.localStorage);
