import { createBrowserCatchImageRepository } from "../indexed-db/create-browser-catch-image-repository";
import { createMemoryCatchImageRepository } from "../memory/create-memory-catch-image-repository";
import type { CatchImageRepository } from "../contracts/catch-image-repository";
import { createLocalStoragePermitReportingRepository } from "../local-storage/create-local-storage-permit-reporting-repository";
import type { PermitReportingRepository } from "../contracts/permit-reporting-repository";
import { mockAppContentRepository } from "../mock/mock-app-content-repository";
import { mockFishingContentRepository } from "../mock/mock-fishing-content-repository";
import { createLocalProfile } from "../local-storage/local-profile";
import { createLocalRuleAcceptances } from "../local-storage/local-rule-acceptance";
import type { AsyncRepository } from "../contracts/async-repository";
import { asAsyncRepository } from "../contracts/async-repository";
import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import type { PermitCatalogRepository } from "../contracts/permit-catalog-repository";
import type { PermitPurchaseRepository } from "../contracts/permit-purchase-repository";
import type { PreferencesRepository } from "../contracts/preferences-repository";
import type { DocumentsRepository } from "../contracts/documents-repository";
import { createLocalStorageFishingLogRepository } from "../local-storage/create-local-storage-fishing-log-repository";
import { createMemoryFishingLogRepository } from "../memory/create-memory-fishing-log-repository";
import { createLocalStoragePermitPurchaseRepository } from "../local-storage/create-local-storage-permit-purchase-repository";
import { createLocalStoragePreferencesRepository } from "../local-storage/create-local-storage-preferences-repository";
import { createMemoryPreferencesRepository } from "../memory/create-memory-preferences-repository";
import { createBrowserDocumentsRepository } from "../local-storage/create-browser-documents-repository";
import { prototypePermitCatalogRepository } from "../prototype/prototype-permit-catalog-repository";
import { browserStorage } from "./browser-storage";
import { appMode, type AppMode } from "./environment";
import { runtimeClock } from "./configure-clock";

export type AppServices = {
  profile: ReturnType<typeof createLocalProfile>;
  ruleAcceptances: ReturnType<typeof createLocalRuleAcceptances>;
  catchImages: CatchImageRepository;
  reportingDays: AsyncRepository<PermitReportingRepository>;
  appContent: typeof mockAppContentRepository;
  fishingContent: typeof mockFishingContentRepository;
  mode: AppMode;
  clock: { now(): number };
  fishingLog: AsyncRepository<FishingLogRepository>;
  catalog: AsyncRepository<PermitCatalogRepository>;
  purchases: AsyncRepository<PermitPurchaseRepository>;
  preferences: AsyncRepository<PreferencesRepository>;
  documents: DocumentsRepository;
};

/** The only place selecting adapters for app-facing, replaceable I/O. No live mode exists yet. */
export function createAppServices(overrides: Partial<AppServices> = {}): AppServices {
  const profile = overrides.profile ?? createLocalProfile(browserStorage);
  const clock = overrides.clock ?? runtimeClock;
  const person = () => {
    const email = profile.read().email.trim().toLowerCase();
    return email || "local-profile";
  };
  return {
    catchImages:
      typeof window === "undefined"
        ? createMemoryCatchImageRepository()
        : createBrowserCatchImageRepository(),
    reportingDays: asAsyncRepository(createLocalStoragePermitReportingRepository(browserStorage)),
    appContent: mockAppContentRepository,
    fishingContent: mockFishingContentRepository,
    profile,
    ruleAcceptances: createLocalRuleAcceptances(browserStorage, person, clock.now),
    mode: appMode,
    clock,
    fishingLog: asAsyncRepository(
      typeof window === "undefined"
        ? createMemoryFishingLogRepository()
        : createLocalStorageFishingLogRepository(browserStorage),
    ),
    catalog: asAsyncRepository(prototypePermitCatalogRepository),
    purchases: asAsyncRepository(createLocalStoragePermitPurchaseRepository(browserStorage)),
    preferences: asAsyncRepository(
      typeof window === "undefined"
        ? createMemoryPreferencesRepository()
        : createLocalStoragePreferencesRepository(browserStorage),
    ),
    documents: createBrowserDocumentsRepository(),
    ...overrides,
  };
}

let defaults: AppServices | undefined;
export function getDefaultAppServices() {
  return (defaults ??= createAppServices());
}
