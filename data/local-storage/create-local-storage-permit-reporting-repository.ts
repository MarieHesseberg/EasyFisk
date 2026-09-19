import { decodeRecords, encodeRecords } from "./versioned-records.ts";
import type { KeyValueStorage } from "../contracts/key-value-storage.ts";
import type { PermitReportingRepository } from "../contracts/permit-reporting-repository.ts";
import { isPermitReportingDay } from "../../domain/fishing-permits/permit-reporting-day.ts";
import {
  operationSucceeded,
  technicalOperationFailed,
} from "../../domain/shared/operation-result.ts";

const defaultStorageKey = "easyfisk:permit-reporting-days:v1";

function read(storage: KeyValueStorage, key: string) {
  const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
  return decodeRecords(value, isPermitReportingDay);
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
        return technicalOperationFailed("storage.read", cause);
      }
    },
    save(record) {
      try {
        if (!isPermitReportingDay(record)) return technicalOperationFailed("storage.invalid-data");
        const records = read(storage, key).filter((entry) => entry.id !== record.id);
        storage.setItem(
          key,
          JSON.stringify(encodeRecords([record, ...records], isPermitReportingDay)),
        );
        return operationSucceeded(undefined);
      } catch (cause) {
        return technicalOperationFailed("storage.write", cause);
      }
    },
  };
}
