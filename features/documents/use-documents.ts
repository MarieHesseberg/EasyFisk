"use client";
import { useCallback, useEffect } from "react";
import { useAppServices } from "@/data/runtime/services-provider";
import { useRepositoryQuery } from "@/hooks/use-repository-query";
import { documentsForLocalProfile } from "@/domain/documents/access-grants";
import { readProfile } from "@/features/profile/local-profile";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { technicalOperationFailed } from "@/domain/shared/operation-result";
const changedEvent = "easyfisk-documents-changed";
export function useDocuments() {
  const { documents: repository, clock } = useAppServices();
  const read = useCallback(async () => {
    const result = await repository.list();
    if (!result.ok) throw new Error(result.error);
    return documentsForLocalProfile(result.value, readProfile().email, clock.now());
  }, [repository, clock]);
  const query = useRepositoryQuery<FishingDocument[]>(read, []);
  const { reload } = query;
  useEffect(() => {
    const refresh = () => {
      void reload();
    };
    window.addEventListener(changedEvent, refresh);
    window.addEventListener("easyfisk-profile-changed", refresh);
    return () => {
      window.removeEventListener(changedEvent, refresh);
      window.removeEventListener("easyfisk-profile-changed", refresh);
    };
  }, [reload]);
  async function write(action: () => ReturnType<typeof repository.save>) {
    try {
      const result = await action();
      if (result.ok) window.dispatchEvent(new Event(changedEvent));
      return result;
    } catch (cause) {
      return technicalOperationFailed("storage.write", cause);
    }
  }
  return {
    documents: query.data,
    loading: query.loading,
    error: query.error,
    reload,
    save: (document: FishingDocument) => write(() => repository.save(document)),
    saveMany: (items: FishingDocument[]) => write(() => repository.saveMany(items)),
    remove: (id: string) => write(() => repository.remove(id)),
  };
}
