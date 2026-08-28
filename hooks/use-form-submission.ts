"use client";

import { useState } from "react";
import type { OperationResult } from "@/domain/shared/operation-result";

export function useFormSubmission(errorMessage: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function run(
    action: () => void | OperationResult<unknown> | Promise<void | OperationResult<unknown>>,
  ) {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await action();
      if (result && !result.ok) {
        setError(result.error);
        return false;
      }
      return true;
    } catch {
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setIsSubmitting(false);
    setError("");
  }

  return { error, isSubmitting, reset, run };
}
