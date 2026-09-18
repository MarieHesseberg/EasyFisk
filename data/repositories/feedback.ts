import { isFeedbackMessage, type FeedbackMessage } from "@/domain/feedback/feedback-message";

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("easyfisk-feedback", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("messages", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Message storage is blocked"));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("messages", mode);
      const request = action(tx.objectStore("messages"));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error ?? request.error);
    });
  } finally {
    db.close();
  }
}
export const feedbackRepository = {
  async list(): Promise<FeedbackMessage[]> {
    const records: unknown[] = await transaction("readonly", (store) => store.getAll());
    if (!records.every(isFeedbackMessage)) throw new Error("Invalid saved message");
    return records.sort((a, b) => b.createdAt - a.createdAt);
  },
  async save(message: FeedbackMessage) {
    if (!isFeedbackMessage(message)) throw new Error("Invalid message");
    await transaction("readwrite", (store) => store.put(message));
  },
};
