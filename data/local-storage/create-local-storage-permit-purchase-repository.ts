import type { KeyValueStorage } from "../contracts/key-value-storage.ts";
import type { PermitPurchaseRepository } from "../contracts/permit-purchase-repository.ts";
import { isPermitPurchase } from "../../domain/fishing-permits/permit-purchase.ts";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";
const defaultStorageKey = "easyfisk:permit-purchases:v1";
function read(storage: KeyValueStorage, key: string) {
  const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
  if (!Array.isArray(value) || !value.every(isPermitPurchase))
    throw new TypeError("Lagrede fiskekortkjøp er ugyldige.");
  return value;
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
        return operationFailed("Kunne ikke lese fiskekortkjøpene på enheten.", cause);
      }
    },
    save(purchase) {
      try {
        if (!isPermitPurchase(purchase))
          return operationFailed("Kjøpet inneholder ugyldige opplysninger.");
        const purchases = read(storage, key).filter((entry) => entry.id !== purchase.id);
        storage.setItem(key, JSON.stringify([purchase, ...purchases]));
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke lagre fiskekortkjøpet på enheten.", cause);
      }
    },
    clear() {
      try {
        storage.setItem(key, "[]");
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke nullstille fiskekortkjøpene på enheten.", cause);
      }
    },
  };
}
