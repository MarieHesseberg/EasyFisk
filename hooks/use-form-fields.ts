"use client";

import { useDraftState } from "./use-draft";

export function useFormFields<Fields extends object>(initialFields: Fields, draftKey = "fields") {
  const [fields, setFields] = useDraftState(draftKey, initialFields);

  function setField<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function reset(overrides?: Partial<Fields>) {
    setFields({ ...initialFields, ...overrides });
  }

  return { fields, reset, setField };
}
