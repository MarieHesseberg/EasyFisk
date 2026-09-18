"use client";

import { documentsForLocalProfile } from "@/domain/documents/access-grants";
import { readProfile } from "@/features/profile/local-profile";
import { getAppNow } from "@/domain/shared/app-clock";
import { useCallback, useEffect, useState } from "react";
import {
  createBrowserDocumentsRepository,
  saveDocumentsAtomically,
} from "@/data/local-storage/create-browser-documents-repository";
import type { FishingDocument } from "@/domain/documents/fishing-document";

const repository = createBrowserDocumentsRepository();
const changedEvent = "easyfisk-documents-changed";

export function useDocuments() {
  const [documents, setDocuments] = useState<FishingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    const result = await repository.list();
    if (result.ok) {
      setDocuments(documentsForLocalProfile(result.value, readProfile().email, getAppNow()));
      setError("");
    } else setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    repository.list().then((result) => {
      if (!active) return;
      if (result.ok)
        setDocuments(documentsForLocalProfile(result.value, readProfile().email, getAppNow()));
      else setError(result.error);
      setLoading(false);
    });
    const refresh = () => {
      void reload();
    };
    window.addEventListener(changedEvent, refresh);
    window.addEventListener("easyfisk-profile-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener(changedEvent, refresh);
      window.removeEventListener("easyfisk-profile-changed", refresh);
    };
  }, [reload]);

  async function save(document: FishingDocument) {
    const result = await repository.save(document);
    if (result.ok) window.dispatchEvent(new Event(changedEvent));
    return result;
  }
  async function remove(id: string) {
    const result = await repository.remove(id);
    if (result.ok) window.dispatchEvent(new Event(changedEvent));
    return result;
  }
  async function saveMany(items: FishingDocument[]) {
    const result = await saveDocumentsAtomically(items);
    if (result.ok) window.dispatchEvent(new Event(changedEvent));
    return result;
  }
  return { documents, loading, error, reload, save, saveMany, remove };
}
