"use client";

import { useState } from "react";

import { validateImage } from "@/domain/images/validate-image";

export function useImageSelection({ includeData = false }: { includeData?: boolean } = {}) {
  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState("");

  function reset() {
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

    const reader = new FileReader();
    reader.onerror = () => setError("Kunne ikke lese bildet.");
    reader.onload = () => setData(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return { data, error, name, reset, select };
}
