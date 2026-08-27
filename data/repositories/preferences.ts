import { createLocalStoragePreferencesRepository } from "@/data/local-storage/create-local-storage-preferences-repository";
import { createMemoryPreferencesRepository } from "@/data/memory/create-memory-preferences-repository";

export const preferencesRepository =
  typeof window === "undefined"
    ? createMemoryPreferencesRepository()
    : createLocalStoragePreferencesRepository(window.localStorage);
