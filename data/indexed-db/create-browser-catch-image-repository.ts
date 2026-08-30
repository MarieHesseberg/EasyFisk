import type { CatchImageRepository } from "@/data/contracts/catch-image-repository";
import { operationFailed, operationSucceeded } from "@/domain/shared/operation-result";
import { logger } from "@/lib/logger";

const databaseName = "easyfisk-catch-images";
const storeName = "images";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Bildelageret er blokkert av en annen fane."));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction(storeName, mode);
      const request = action(tx.objectStore(storeName));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? request.error);
      tx.onerror = () => reject(tx.error ?? request.error);
    });
  } finally {
    database.close();
  }
}

export function createBrowserCatchImageRepository(): CatchImageRepository {
  return {
    async get(id) {
      try {
        const value: unknown = await transaction("readonly", (store) => store.get(id));
        if (value === undefined) return operationSucceeded(null);
        if (typeof value !== "string") return operationFailed("Fangstbildet har ugyldig format.");
        return operationSucceeded(value);
      } catch (cause) {
        logger.error("Fangstbildet kunne ikke leses.", { cause });
        return operationFailed("Kunne ikke lese fangstbildet på enheten.", cause);
      }
    },
    async save(id, imageData) {
      try {
        await transaction("readwrite", (store) => store.put(imageData, id));
        return operationSucceeded(undefined);
      } catch (cause) {
        logger.error("Fangstbildet kunne ikke lagres.", { cause });
        return operationFailed("Kunne ikke lagre fangstbildet på enheten.", cause);
      }
    },
    async remove(id) {
      try {
        await transaction("readwrite", (store) => store.delete(id));
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke rydde opp fangstbildet.", cause);
      }
    },
  };
}
