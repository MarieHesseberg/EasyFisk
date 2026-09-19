import { decodeRecords, encodeRecords } from "./versioned-records.ts";
import type { KeyValueStorage } from "../contracts/key-value-storage.ts";
import type { PermitPurchaseRepository } from "../contracts/permit-purchase-repository.ts";
import { isPermitPurchase } from "../../domain/fishing-permits/permit-purchase.ts";
import {
  operationSucceeded,
  technicalOperationFailed,
} from "../../domain/shared/operation-result.ts";
const defaultStorageKey = "easyfisk:permit-purchases:v1";
function read(storage: KeyValueStorage, key: string) {
  const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
  return decodeRecords(value, isPermitPurchase);
}
export function createLocalStoragePermitPurchaseRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): PermitPurchaseRepository {
  return {
    list() {
      try {
        return operationSucceeded(read(storage, key).sort((a, b) => b.createdAt - a.createdAt));
      } catch (cause) {
        return technicalOperationFailed("storage.read", cause);
      }
    },
    save(purchase) {
      try {
        if (!isPermitPurchase(purchase)) return technicalOperationFailed("storage.invalid-data");
        const purchases = read(storage, key).filter((entry) => entry.id !== purchase.id);
        storage.setItem(
          key,
          JSON.stringify(encodeRecords([purchase, ...purchases], isPermitPurchase)),
        );
        return operationSucceeded(undefined);
      } catch (cause) {
        return technicalOperationFailed("storage.write", cause);
      }
    },
    clear() {
      try {
        storage.setItem(key, JSON.stringify(encodeRecords([], isPermitPurchase)));
        return operationSucceeded(undefined);
      } catch (cause) {
        return technicalOperationFailed("storage.clear", cause);
      }
    },
  };
}
