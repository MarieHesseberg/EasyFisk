import type { DocumentsRepository } from "@/data/contracts/documents-repository";
import { isFishingDocument } from "@/domain/documents/validate-document";
import { operationFailed, operationSucceeded } from "@/domain/shared/operation-result";
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
          return operationFailed(
            "Dokumentlageret inneholder ugyldige data. Ingen dokumenter er slettet.",
          );
        return operationSucceeded(records.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (cause) {
        logger.error("Dokumentlageret kunne ikke leses.");
        return operationFailed("Kunne ikke lese dokumentene på enheten. Prøv igjen.", cause);
      }
    },
    async save(document) {
      try {
        if (!isFishingDocument(document))
          return operationFailed("Dokumentet inneholder ugyldige opplysninger.");
        await transaction("readwrite", (store) => store.put(document));
        return operationSucceeded(undefined);
      } catch (cause) {
        logger.error("Dokumentlagring mislyktes.");
        return operationFailed(
          "Kunne ikke lagre dokumentet. Lagring kan være blokkert eller full. Opplysningene er fortsatt i skjemaet.",
          cause,
        );
      }
    },
    async remove(id) {
      try {
        await transaction("readwrite", (store) => store.delete(id));
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke slette dokumentet.", cause);
      }
    },
  };
}
