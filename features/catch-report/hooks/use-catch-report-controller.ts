"use client";

import { useState } from "react";

import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchRecord } from "@/domain/models";

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
  const [species, setSpecies] = useState("Laks");
  const [result, setResult] = useState("Gjenutsatt");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageData, setImageData] = useState("");
  const [touched, setTouched] = useState(false);
  const [violationConfirmed, setViolationConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lengthNumber = parseMeasurement(length);
  const weightNumber = parseMeasurement(weight);
  const validation = validateCatch(species, result, lengthNumber, weightNumber);
  const sentCatch = submitted ? catches[catches.length - 1] : null;

  function submit() {
    if (submitted) return;
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
      imageName,
      imageData,
      comment,
    });
    setSubmitted(true);
    setStep(4);
  }

  function continueToReview() {
    setTouched(true);
    if (validation.detailsValid) setStep(3);
  }

  function selectImage(file?: File) {
    setImageName(file?.name ?? "");
    if (!file) {
      setImageData("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return {
    state: {
      comment,
      imageData,
      imageName,
      length,
      lengthNumber,
      result,
      sentCatch,
      species,
      step,
      submitted,
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
