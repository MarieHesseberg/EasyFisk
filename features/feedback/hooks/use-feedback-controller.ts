"use client";

import { useState } from "react";

export function useFeedbackController() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageName, setImageName] = useState("");
  const [hasPosition, setHasPosition] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isValid = category !== "" && description.trim().length >= 10;

  function reset() {
    setStep(1);
    setCategory("");
    setDescription("");
    setImageName("");
    setHasPosition(false);
    setIsTouched(false);
    setIsConfirmed(false);
  }

  return {
    state: { category, description, hasPosition, imageName, isConfirmed, isTouched, isValid, step },
    actions: {
      reset,
      setCategory,
      setDescription,
      setHasPosition,
      setImageName,
      setIsConfirmed,
      setIsTouched,
      setStep,
    },
  };
}

export type FeedbackController = ReturnType<typeof useFeedbackController>;
