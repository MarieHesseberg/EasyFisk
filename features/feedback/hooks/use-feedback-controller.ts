"use client";

import { useState } from "react";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { useFormFields } from "@/hooks/use-form-fields";
import { useImageSelection } from "@/hooks/use-image-selection";

export function useFeedbackController() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const form = useFormFields({
    category: "",
    description: "",
    hasPosition: false,
    isConfirmed: false,
    isTouched: false,
  });
  const image = useImageSelection();
  const submission = useFormSubmission("Kunne ikke sende meldingen. Prøv igjen.");
  const { category, description, hasPosition, isConfirmed, isTouched } = form.fields;
  const isValid = category !== "" && description.trim().length >= 10;

  function reset() {
    setStep(1);
    form.reset();
    image.reset();
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
      setCategory: (value: string) => form.setField("category", value),
      setDescription: (value: string) => form.setField("description", value),
      setHasPosition: (value: boolean) => form.setField("hasPosition", value),
      setIsConfirmed: (value: boolean) => form.setField("isConfirmed", value),
      setIsTouched: (value: boolean) => form.setField("isTouched", value),
      setStep,
    },
  };
}

export type FeedbackController = ReturnType<typeof useFeedbackController>;
