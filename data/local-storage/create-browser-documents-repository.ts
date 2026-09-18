import type { FishingDocument } from "@/domain/documents/fishing-document";
import type { DocumentsRepository } from "@/data/contracts/documents-repository";
import { isFishingDocument } from "@/domain/documents/validate-document";
import { operationSucceeded, technicalOperationFailed } from "@/domain/shared/operation-result";
import { logger } from "@/lib/logger";

// IndexedDB lagrer vedlegg uten å fylle den langt mindre localStorage-kvoten.
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("easyfisk-documents", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("documents", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Dokumentlageret er blokkert av en annen fane."));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction("documents", mode);
      const request = action(tx.objectStore("documents"));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? request.error);
      tx.onerror = () => reject(tx.error ?? request.error);
    });
  } finally {
    database.close();
  }
}

export function createBrowserDocumentsRepository(): DocumentsRepository {
  return {
    async list() {
      try {
        const records: unknown[] = await transaction("readonly", (store) => store.getAll());
        if (!records.every(isFishingDocument))
          return technicalOperationFailed("storage.invalid-data");
        return operationSucceeded(records.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (cause) {
        logger.error("Dokumentlageret kunne ikke leses.");
        return technicalOperationFailed("storage.read", cause);
      }
    },
    async save(document) {
      try {
        if (!isFishingDocument(document)) return technicalOperationFailed("storage.invalid-data");
        await transaction("readwrite", (store) => store.put(document));
        return operationSucceeded(undefined);
      } catch (cause) {
        logger.error("Dokumentlagring mislyktes.");
        return technicalOperationFailed("storage.write", cause);
      }
    },
    async remove(id) {
      try {
        await transaction("readwrite", (store) => store.delete(id));
        return operationSucceeded(undefined);
      } catch (cause) {
        return technicalOperationFailed("storage.delete", cause);
      }
    },
  };
}

export async function saveDocumentsAtomically(documents: FishingDocument[]) {
  if (!documents.length || !documents.every(isFishingDocument))
    return technicalOperationFailed("storage.invalid-data");
  try {
    const database = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction("documents", "readwrite");
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
        tx.onerror = () => reject(tx.error);
        for (const document of documents) tx.objectStore("documents").put(document);
      });
      return operationSucceeded(undefined);
    } finally {
      database.close();
    }
  } catch (cause) {
    return technicalOperationFailed("storage.write", cause);
  }
}
