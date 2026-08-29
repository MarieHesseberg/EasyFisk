"use client";

import { useState } from "react";

import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { isReportLate } from "@/domain/catches/reporting-deadline";
import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchOutcome, CatchRecord, FishSpecies } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { OperationResult } from "@/domain/shared/operation-result";
import type { ZoneId } from "@/domain/zones/zone";
import { getNorwegianCalendarDate, getQuotaStatus } from "@/domain/quotas/get-quota-status";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import { isCatchWithinSession, isValidSessionTime } from "@/domain/sessions/session-timing";
import { getSubzones, isDateWithinZoneSeason } from "@/domain/zones/zone-rules";
import { useImageSelection } from "@/hooks/use-image-selection";
import { useFormFields } from "@/hooks/use-form-fields";
import { useFormSubmission } from "@/hooks/use-form-submission";

export function usePastSessionController({
  existingCatches,
  onSave,
}: {
  existingCatches: CatchRecord[];
  onSave: (record: SessionRecord, catches?: CatchRecord[]) => OperationResult<unknown>;
}) {
  const zones = fishingContentRepository.getZones();
  const [openedAt] = useState(() => Date.now());
  const today = getNorwegianCalendarDate(openedAt);
  const suggestedPastDate = getNorwegianCalendarDate(openedAt - 24 * 60 * 60 * 1000);
  const [step, setStep] = useState(1);
  const sessionForm = useFormFields<{
    caught: boolean;
    date: string;
    from: string;
    subzone: string;
    to: string;
    zone: ZoneId;
  }>({
    caught: false,
    date: suggestedPastDate,
    from: "17:00",
    subzone: "",
    to: "19:00",
    zone: fishingContentRepository.getSuggestedZoneId(),
  });
  const catchForm = useFormFields<{
    catchAt: string;
    comment: string;
    length: string;
    outcome: CatchOutcome;
    species: FishSpecies;
    weight: string;
  }>({
    catchAt: "18:00",
    comment: "",
    length: "",
    outcome: "Gjenutsatt",
    species: "Laks",
    weight: "",
  });
  const image = useImageSelection({ includeData: true });
  const submission = useFormSubmission("Kunne ikke lagre fisketuren. Prøv igjen.");
  const [reports, setReports] = useState<CatchRecord[]>([]);
  const [touched, setTouched] = useState(false);
  const { caught, date, from, subzone, to, zone } = sessionForm.fields;
  const { catchAt, comment, length, outcome, species, weight } = catchForm.fields;

  const start = new Date(`${date}T${from}`).getTime();
  const end = new Date(`${date}T${to}`).getTime();
  const caughtAt = new Date(`${date}T${catchAt}`).getTime();
  const validTime = Boolean(date && from && to && isValidSessionTime(start, end, openedAt));
  const validCatchTime = isCatchWithinSession(caughtAt, start, end);
  const lengthNumber = parseMeasurement(length);
  const weightNumber = parseMeasurement(weight);
  const zoneBase = zones.find((item) => item.id === zone)?.name || `Sone ${zone}`;
  const zoneName = subzone ? `${zoneBase} · ${subzone}` : zoneBase;
  const withinSeason = isDateWithinZoneSeason(date, zone);
  const quota = getQuotaStatus(existingCatches, reports);
  const catchValid =
    validateCatch(species, outcome, lengthNumber, weightNumber).detailsValid && validCatchTime;
  const subzones = getSubzones(zone);

  function resetCatch() {
    catchForm.reset({ catchAt: to });
    image.reset();
  }

  function addCatch(review: boolean) {
    setTouched(true);
    if (!catchValid) return;
    const violation = validateCatch(species, outcome, lengthNumber, weightNumber).blocked;
    const record: CatchRecord = {
      id: `ME-ETTER-${openedAt}-${reports.length + 1}`,
      caughtAt,
      submittedAt: openedAt,
      sessionStart: start,
      species,
      result: outcome,
      length: lengthNumber,
      weight: weightNumber,
      zone: zoneName,
      violation,
      late: isReportLate(caughtAt, openedAt),
      imageName: image.name,
      imageData: image.data,
      comment,
    };
    setReports((current) => [...current, record]);
    resetCatch();
    setTouched(false);
    setStep(review ? 3 : 2);
  }

  async function submit() {
    const result = reports.length
      ? `${reports.length} fangst${reports.length === 1 ? "" : "er"} · etterregistrert`
      : "Nullfangst · etterregistrert";
    const succeeded = await submission.run(() =>
      onSave(createSessionRecord(start, end, zoneName, result), reports),
    );
    if (succeeded) setStep(4);
  }

  function removeCatch(id: string) {
    setReports((current) => current.filter((report) => report.id !== id));
    setStep(2);
  }

  return {
    state: {
      catchAt,
      catchValid,
      caught,
      comment,
      dailyValid: quota.dailyValid,
      date,
      end,
      from,
      imageName: image.name,
      imageError: image.error,
      isSubmitting: submission.isSubmitting,
      length,
      lengthNumber,
      openedAt,
      outcome,
      quota,
      reports,
      species,
      start,
      step,
      submissionError: submission.error,
      subzone,
      subzones,
      to,
      today,
      touched,
      validCatchTime,
      validTime,
      weight,
      weightNumber,
      withinSeason,
      zone,
      zoneBase,
      zoneName,
    },
    actions: {
      addCatch,
      removeCatch,
      selectImage: image.select,
      setCatchAt: (value: string) => catchForm.setField("catchAt", value),
      setCaught: (value: boolean) => sessionForm.setField("caught", value),
      setComment: (value: string) => catchForm.setField("comment", value),
      setDate: (value: string) => sessionForm.setField("date", value),
      setFrom: (value: string) => sessionForm.setField("from", value),
      setLength: (value: string) => catchForm.setField("length", value),
      setOutcome: (value: CatchOutcome) => catchForm.setField("outcome", value),
      setSpecies: (value: FishSpecies) => catchForm.setField("species", value),
      setStep,
      setSubzone: (value: string) => sessionForm.setField("subzone", value),
      setTo: (value: string) => sessionForm.setField("to", value),
      setTouched,
      setWeight: (value: string) => catchForm.setField("weight", value),
      setZone: (value: ZoneId) => sessionForm.setField("zone", value),
      submit,
    },
  };
}

export type PastSessionController = ReturnType<typeof usePastSessionController>;
