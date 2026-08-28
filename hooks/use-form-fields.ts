"use client";

import { useState } from "react";

export function useFormFields<Fields extends object>(initialFields: Fields) {
  const [fields, setFields] = useState(initialFields);

  function setField<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function reset(overrides?: Partial<Fields>) {
    setFields({ ...initialFields, ...overrides });
  }

  return { fields, reset, setField };
}
