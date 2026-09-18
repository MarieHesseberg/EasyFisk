"use client";

import { useRef, useState } from "react";
import { useDraftState } from "./use-draft";

import { validateImage } from "@/domain/images/validate-image";

export function useImageSelection({ includeData = false }: { includeData?: boolean } = {}) {
  const [name, setName] = useDraftState("imageName", "");
  const [data, setData] = useDraftState("imageData", "");
  const generation = useRef(0);
  const [error, setError] = useState("");

  function reset() {
    generation.current += 1;
    setName("");
    setData("");
    setError("");
  }

  function select(file?: File) {
    reset();
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setName(file.name);
    if (!includeData) return;

    const current = generation.current;
    const reader = new FileReader();
    reader.onerror = () => setError("Kunne ikke lese bildet.");
    reader.onload = () => {
      if (current === generation.current) setData(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  }

  return { data, error, name, reset, select };
}
