let database: Promise<IDBDatabase> | undefined;
function open() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("easyfisk-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      database = undefined;
      reject(request.error);
    };
    request.onblocked = () => {
      database = undefined;
      reject(new Error("Draft storage blocked"));
    };
  });
  return database;
}
async function transact<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("drafts", mode);
    const request = action(tx.objectStore("drafts"));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = tx.onabort = () => reject(tx.error ?? request.error);
  });
}
const queues = new Map<string, Promise<unknown>>();
function enqueue<T>(id: string, action: () => Promise<T>) {
  const next = (queues.get(id) ?? Promise.resolve()).catch(() => {}).then(action);
  queues.set(id, next);
  return next;
}
export const draftRepository = {
  async read(id: string): Promise<Record<string, unknown>> {
    await queues.get(id)?.catch(() => {});
    const value = await transact("readonly", (store) => store.get(id));
    if (value === undefined) return {};
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Invalid draft");
    return value;
  },
  save: (id: string, fields: Record<string, unknown>) =>
    enqueue(id, () => transact("readwrite", (store) => store.put(fields, id))),
  remove: (id: string) => enqueue(id, () => transact("readwrite", (store) => store.delete(id))),
};
