"use client";

import { useState } from "react";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { useImageSelection } from "@/hooks/use-image-selection";

export function useFeedbackController() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [hasPosition, setHasPosition] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const image = useImageSelection();
  const submission = useFormSubmission("Kunne ikke sende meldingen. Prøv igjen.");
  const isValid = category !== "" && description.trim().length >= 10;

  function reset() {
    setStep(1);
    setCategory("");
    setDescription("");
    image.reset();
    setHasPosition(false);
    setIsTouched(false);
    setIsConfirmed(false);
    submission.reset();
  }

  async function submit() {
    const succeeded = await submission.run(() => Promise.resolve());
    if (succeeded) setStep(3);
  }

  return {
    state: {
      category,
      description,
      hasPosition,
      imageError: image.error,
      imageName: image.name,
      isConfirmed,
      isSubmitting: submission.isSubmitting,
      isTouched,
      isValid,
      step,
      submissionError: submission.error,
    },
    actions: {
      reset,
      selectImage: image.select,
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
