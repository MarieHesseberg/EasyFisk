import type { KeyValueStorage } from "../contracts/key-value-storage.ts";
import type { PermitReportingRepository } from "../contracts/permit-reporting-repository.ts";
import { isPermitReportingDay } from "../../domain/fishing-permits/permit-reporting-day.ts";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";

const defaultStorageKey = "easyfisk:permit-reporting-days:v1";

function read(storage: KeyValueStorage, key: string) {
  const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
  if (!Array.isArray(value) || !value.every(isPermitReportingDay))
    throw new TypeError("Lagrede rapporteringsdøgn er ugyldige.");
  return value;
}

export function createLocalStoragePermitReportingRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): PermitReportingRepository {
  return {
    list() {
      try {
        return operationSucceeded(read(storage, key).sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (cause) {
        return operationFailed("Kunne ikke lese rapporteringsdøgnene på enheten.", cause);
      }
    },
    save(record) {
      try {
        if (!isPermitReportingDay(record))
          return operationFailed("Rapporteringsdøgnet inneholder ugyldige opplysninger.");
        const records = read(storage, key).filter((entry) => entry.id !== record.id);
        storage.setItem(key, JSON.stringify([record, ...records]));
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke lagre rapporteringsdøgnet på enheten.", cause);
      }
    },
  };
}
