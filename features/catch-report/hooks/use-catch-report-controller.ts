"use client";

import { useState } from "react";

import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchOutcome, CatchRecord, FishSpecies } from "@/domain/catches/catch";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { useImageSelection } from "@/hooks/use-image-selection";

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
  const [touched, setTouched] = useState(false);
  const [violationConfirmed, setViolationConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const image = useImageSelection({ includeData: true });
  const submission = useFormSubmission("Kunne ikke lagre fangsten. Prøv igjen.");

  const lengthNumber = parseMeasurement(length);
  const weightNumber = parseMeasurement(weight);
  const validation = validateCatch(species, result, lengthNumber, weightNumber);
  const sentCatch = submitted ? catches[catches.length - 1] : null;

  async function submit() {
    if (submitted) return;
    const succeeded = await submission.run(() =>
      onCatch({
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
        imageName: image.name,
        imageData: image.data,
        comment,
      }),
    );
    if (succeeded) {
      setSubmitted(true);
      setStep(4);
    }
  }

  function continueToReview() {
    setTouched(true);
    if (validation.detailsValid) setStep(3);
  }

  return {
    state: {
      comment,
      imageData: image.data,
      imageName: image.name,
      imageError: image.error,
      isSubmitting: submission.isSubmitting,
      length,
      lengthNumber,
      result,
      sentCatch,
      species,
      step,
      submitted,
      submissionError: submission.error,
      touched,
      validation,
      violationConfirmed,
      weight,
      weightNumber,
    },
    actions: {
      continueToReview,
      selectImage: image.select,
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
