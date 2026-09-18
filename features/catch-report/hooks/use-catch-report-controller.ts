"use client";

import { useDraft, useDraftState } from "@/hooks/use-draft";
import { useRef, useState } from "react";

import { getLocalDeliveryGuidance } from "@/domain/catches/local-delivery-guidance";
import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchOutcome, CatchRecord, FishSpecies } from "@/domain/catches/catch";
import type { AsyncOperationResult } from "@/domain/shared/operation-result";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { useFormFields } from "@/hooks/use-form-fields";
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
  onCatch: (record: CatchRecord) => AsyncOperationResult<unknown>;
  sessionStart: number;
}) {
  const draft = useDraft();
  const submitLock = useRef(false);
  const [step, setStep] = useDraftState("step", 1);
  const form = useFormFields<{
    comment: string;
    length: string;
    result: CatchOutcome;
    species: FishSpecies;
    touched: boolean;
    violationConfirmed: boolean;
    weight: string;
  }>({
    comment: "",
    length: "",
    result: "Gjenutsatt",
    species: "Laks",
    touched: false,
    violationConfirmed: false,
    weight: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const image = useImageSelection({ includeData: true });
  const submission = useFormSubmission("Kunne ikke lagre fangsten. Prøv igjen.");
  const { comment, length, result, species, touched, violationConfirmed, weight } = form.fields;

  const lengthNumber = parseMeasurement(length);
  const weightNumber = parseMeasurement(weight);
  const validation = validateCatch(species, result, lengthNumber, weightNumber);
  const sentCatch = submitted ? catches[catches.length - 1] : null;

  async function submit() {
    form.setField("touched", true);
    if (
      submitted ||
      submitLock.current ||
      !validation.detailsValid ||
      image.error ||
      (validation.blocked && !violationConfirmed)
    )
      return;
    submitLock.current = true;
    try {
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
        await draft?.complete();
        setSubmitted(true);
        setStep(4);
      }
    } finally {
      submitLock.current = false;
    }
  }

  function continueToReview() {
    form.setField("touched", true);
    if (validation.detailsValid) setStep(3);
  }

  return {
    state: {
      deliveryGuidance: getLocalDeliveryGuidance(activeZone),
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
      setComment: (value: string) => form.setField("comment", value),
      setLength: (value: string) => {
        form.setField("length", value);
        form.setField("violationConfirmed", false);
      },
      setResult: (value: CatchOutcome) => {
        form.setField("result", value);
        form.setField("violationConfirmed", false);
      },
      setSpecies: (value: FishSpecies) => {
        form.setField("species", value);
        form.setField("violationConfirmed", false);
      },
      setStep,
      setViolationConfirmed: (value: boolean) => form.setField("violationConfirmed", value),
      setWeight: (value: string) => {
        form.setField("weight", value);
        form.setField("violationConfirmed", false);
      },
      submit,
    },
  };
}

export type CatchReportController = ReturnType<typeof useCatchReportController>;
