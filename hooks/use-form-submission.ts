"use client";

import { useState } from "react";

export function useFormSubmission(errorMessage: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => void | Promise<void>) {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setError("");
    try {
      await action();
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
