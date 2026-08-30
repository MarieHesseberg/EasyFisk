"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserDocumentsRepository } from "@/data/local-storage/create-browser-documents-repository";
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
      setDocuments(result.value);
      setError("");
    } else setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    repository.list().then((result) => {
      if (!active) return;
      if (result.ok) setDocuments(result.value);
      else setError(result.error);
      setLoading(false);
    });
    const refresh = () => {
      void reload();
    };
    window.addEventListener(changedEvent, refresh);
    return () => {
      active = false;
      window.removeEventListener(changedEvent, refresh);
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
  return { documents, loading, error, reload, save, remove };
}
