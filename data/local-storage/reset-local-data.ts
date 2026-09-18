import { draftRepository } from "@/data/repositories/drafts";
export const resetScopes = [
  "all",
  "fishing",
  "documents",
  "feedback",
  "profile",
  "settings",
  "drafts",
] as const;
export type ResetScope = (typeof resetScopes)[number];
const databaseStores = {
  "easyfisk-documents": "documents",
  "easyfisk-feedback": "messages",
  "easyfisk-drafts": "drafts",
  "easyfisk-catch-images": "images",
} as const;
const keys: Record<ResetScope, string[]> = {
  all: [],
  fishing: ["easyfisk:fishing-log:v1"],
  documents: [
    "easyfisk:permit-purchases:v1",
    "easyfisk:permit-reporting-days:v1",
    "easyfisk-permit-journey-v1",
  ],
  feedback: [],
  profile: ["easyfisk-profile-v1"],
  settings: [
    "easyfisk:preferences:v1",
    "easyfisk-language",
    "easyfisk-read-notices-v1",
    "easyfisk-rule-acceptances-v1",
  ],
  drafts: ["easyfisk-permit-journey-v1"],
};
export function storageKeysForReset(scope: ResetScope, storage: Storage): string[] {
  if (scope !== "all") return [...new Set([...keys[scope], "easyfisk-permit-journey-v1"])];
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => !!key && /^(easyfisk-|easyfisk:)/.test(key),
  );
}
async function clearDatabase(name: keyof typeof databaseStores) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(
        databaseStores[name],
        name === "easyfisk-documents" || name === "easyfisk-feedback"
          ? { keyPath: "id" }
          : undefined,
      );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Storage blocked"));
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(Array.from(db.objectStoreNames), "readwrite");
      for (const store of Array.from(db.objectStoreNames)) tx.objectStore(store).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
/** Called after the application forms have unmounted, so old drafts cannot be restored. */
export async function resetLocalData(scope: ResetScope) {
  await draftRepository.flush();
  const databases: (keyof typeof databaseStores)[] = ["easyfisk-drafts"];
  if (scope === "all" || scope === "documents") databases.push("easyfisk-documents");
  if (scope === "all" || scope === "feedback") databases.push("easyfisk-feedback");
  if (scope === "all" || scope === "fishing") databases.push("easyfisk-catch-images");
  const results = await Promise.allSettled(databases.map(clearDatabase));
  if (results.some((result) => result.status === "rejected"))
    throw new Error("Some local data could not be deleted. Retry to finish.");
  for (const storage of [localStorage, sessionStorage])
    for (const key of storageKeysForReset(scope, storage)) storage.removeItem(key);
}
