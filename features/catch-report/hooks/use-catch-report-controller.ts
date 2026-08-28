"use client";

import { useState } from "react";

import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchOutcome, CatchRecord, FishSpecies } from "@/domain/catches/catch";
import { validateImage } from "@/domain/images/validate-image";

export function useCatchReportController({
  activeZone,
  catches,
  caughtAt,
  onCatch,
  sessionStart,
}: {
  activeZone: string;
  catches: CatchRecord[];
  caughtAt: number;
  onCatch: (record: CatchRecord) => void;
  sessionStart: number;
}) {
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState<FishSpecies>("Laks");
  const [result, setResult] = useState<CatchOutcome>("Gjenutsatt");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageData, setImageData] = useState("");
  const [touched, setTouched] = useState(false);
  const [violationConfirmed, setViolationConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [imageError, setImageError] = useState("");

  const lengthNumber = parseMeasurement(length);
  const weightNumber = parseMeasurement(weight);
  const validation = validateCatch(species, result, lengthNumber, weightNumber);
  const sentCatch = submitted ? catches[catches.length - 1] : null;

  async function submit() {
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError("");
    try {
      await onCatch({
        id: "pending",
        caughtAt,
        submittedAt: 0,
        sessionStart,
        species,
        result,
        length: lengthNumber,
        weight: weightNumber,
        zone: activeZone,
        violation: validation.blocked,
        late: false,
        imageName,
        imageData,
        comment,
      });
      setSubmitted(true);
      setStep(4);
    } catch {
      setSubmissionError("Kunne ikke lagre fangsten. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function continueToReview() {
    setTouched(true);
    if (validation.detailsValid) setStep(3);
  }

  function selectImage(file?: File) {
    setImageError("");
    setImageName(file?.name ?? "");
    if (!file) {
      setImageData("");
      return;
    }

    const validation = validateImage(file);
    if (!validation.ok) {
      setImageName("");
      setImageData("");
      setImageError(validation.error);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setImageError("Kunne ikke lese bildet.");
    reader.onload = () => setImageData(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return {
    state: {
      comment,
      imageData,
      imageName,
      imageError,
      isSubmitting,
      length,
      lengthNumber,
      result,
      sentCatch,
      species,
      step,
      submitted,
      submissionError,
      touched,
      validation,
      violationConfirmed,
      weight,
      weightNumber,
    },
    actions: {
      continueToReview,
      selectImage,
      setComment,
      setLength,
      setResult,
      setSpecies,
      setStep,
      setViolationConfirmed,
      setWeight,
      submit,
    },
  };
}

export type CatchReportController = ReturnType<typeof useCatchReportController>;
