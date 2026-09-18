"use client";
import { useDraft, useDraftState } from "@/hooks/use-draft";
import { useRef, useState } from "react";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { useFormFields } from "@/hooks/use-form-fields";
import { useUserLocation } from "@/features/map/hooks/use-user-location";
import { validateImage } from "@/domain/images/validate-image";
import type { FeedbackMessage } from "@/domain/feedback/feedback-message";
import { feedbackRepository } from "@/data/repositories/feedback";
import { getAppNow } from "@/domain/shared/app-clock";
import { createLocalId } from "@/lib/create-local-id";

export function useFeedbackController() {
  const draft = useDraft();
  const [step, setStep] = useDraftState<1 | 2 | 3>("step", 1);
  const form = useFormFields({
    category: "",
    description: "",
    isConfirmed: false,
    isTouched: false,
  });
  const [image, setImage] = useDraftState<File | undefined>("image", undefined);
  const [imageError, setImageError] = useState("");
  const [position, setPosition] = useDraftState<[number, number] | undefined>(
    "position",
    undefined,
  );
  const [receipt, setReceipt] = useState<FeedbackMessage>();
  const lock = useRef(false);
  const id = useRef<string | undefined>(undefined);
  const location = useUserLocation((coords) => {
    setPosition(coords);
    return undefined;
  });
  const submission = useFormSubmission("feedback.saveError");
  const { category, description, isConfirmed, isTouched } = form.fields;
  const isValid =
    category !== "" && description.trim().length >= 10 && description.length <= 1000 && !imageError;
  function reset() {
    if (receipt) {
      draft?.discard();
      return;
    }
    setStep(1);
    form.reset();
    setImage(undefined);
    setImageError("");
    setPosition(undefined);
    setReceipt(undefined);
    id.current = undefined;
    location.cancel();
    submission.reset();
  }
  function selectImage(file?: File) {
    setImage(undefined);
    setImageError("");
    if (!file) return;
    const result = validateImage(file);
    if (!result.ok || file.size === 0) {
      setImageError(result.ok ? "feedback.emptyImage" : result.error);
      return;
    }
    setImage(file);
  }
  function setHasPosition(value: boolean) {
    if (value) location.locate();
    else {
      location.cancel();
      setPosition(undefined);
    }
  }
  async function submit() {
    if (lock.current || receipt || !isValid || !isConfirmed || location.isLoading) return;
    lock.current = true;
    try {
      const succeeded = await submission.run(async () => {
        id.current ??= createLocalId();
        const message: FeedbackMessage = {
          id: id.current,
          reference: `EF-${id.current.replaceAll("-", "").slice(0, 12).toUpperCase()}`,
          category,
          description: description.trim(),
          createdAt: getAppNow(),
          status: "simulated-received",
          position,
          image,
          imageName: image?.name,
        };
        await feedbackRepository.save(message);
        await draft?.complete();
        setReceipt(message);
      });
      if (succeeded) setStep(3);
    } finally {
      lock.current = false;
    }
  }
  return {
    state: {
      category,
      description,
      hasPosition: !!position,
      position,
      location,
      imageError,
      imageName: image?.name ?? "",
      image,
      receipt,
      isConfirmed,
      isSubmitting: submission.isSubmitting,
      isTouched,
      isValid,
      step,
      submissionError: submission.error,
    },
    actions: {
      reset,
      selectImage,
      submit,
      setHasPosition,
      setCategory: (value: string) => form.setField("category", value),
      setDescription: (value: string) => form.setField("description", value),
      setIsConfirmed: (value: boolean) => form.setField("isConfirmed", value),
      setIsTouched: (value: boolean) => form.setField("isTouched", value),
      setStep,
    },
  };
}
export type FeedbackController = ReturnType<typeof useFeedbackController>;
