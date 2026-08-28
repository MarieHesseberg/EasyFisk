"use client";

import { useState } from "react";
import { validateImage } from "@/domain/images/validate-image";

export function useFeedbackController() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [hasPosition, setHasPosition] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const isValid = category !== "" && description.trim().length >= 10;

  function reset() {
    setStep(1);
    setCategory("");
    setDescription("");
    setImageName("");
    setImageError("");
    setHasPosition(false);
    setIsTouched(false);
    setIsConfirmed(false);
    setIsSubmitting(false);
    setSubmissionError("");
  }

  async function submit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError("");
    try {
      await Promise.resolve();
      setStep(3);
    } catch {
      setSubmissionError("Kunne ikke sende meldingen. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectImage(file?: File) {
    setImageError("");
    if (!file) {
      setImageName("");
      return;
    }
    const result = validateImage(file);
    if (!result.ok) {
      setImageName("");
      setImageError(result.error);
      return;
    }
    setImageName(file.name);
  }

  return {
    state: {
      category,
      description,
      hasPosition,
      imageError,
      imageName,
      isConfirmed,
      isSubmitting,
      isTouched,
      isValid,
      step,
      submissionError,
    },
    actions: {
      reset,
      selectImage,
      submit,
      setCategory,
      setDescription,
      setHasPosition,
      setIsConfirmed,
      setIsTouched,
      setStep,
    },
  };
}

export type FeedbackController = ReturnType<typeof useFeedbackController>;
