"use client";

import { useState } from "react";

import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { isReportLate } from "@/domain/catches/reporting-deadline";
import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchOutcome, CatchRecord, FishSpecies } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { ZoneId } from "@/domain/zones/zone";
import { getQuotaStatus } from "@/domain/quotas/get-quota-status";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import { isCatchWithinSession, isValidSessionTime } from "@/domain/sessions/session-timing";
import { getSubzones, isDateWithinZoneSeason } from "@/domain/zones/zone-rules";

export function usePastSessionController({
  existingCatches,
  onSave,
}: {
  existingCatches: CatchRecord[];
  onSave: (record: SessionRecord, catches?: CatchRecord[]) => void;
}) {
  const zones = fishingContentRepository.getZones();
  const [openedAt] = useState(() => Date.now());
  const today = new Date(openedAt).toISOString().slice(0, 10);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState("17:00");
  const [to, setTo] = useState("19:00");
  const [zone, setZone] = useState<ZoneId>(3);
  const [subzone, setSubzone] = useState("");
  const [caught, setCaught] = useState(false);
  const [catchAt, setCatchAt] = useState("18:00");
  const [species, setSpecies] = useState<FishSpecies>("Laks");
  const [outcome, setOutcome] = useState<CatchOutcome>("Gjenutsatt");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageData, setImageData] = useState("");
  const [reports, setReports] = useState<CatchRecord[]>([]);
  const [touched, setTouched] = useState(false);

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
    setSpecies("Laks");
    setOutcome("Gjenutsatt");
    setLength("");
    setWeight("");
    setComment("");
    setImageName("");
    setImageData("");
    setCatchAt(to);
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
      imageName,
      imageData,
      comment,
    };
    setReports((current) => [...current, record]);
    resetCatch();
    setTouched(false);
    setStep(review ? 3 : 2);
  }

  function submit() {
    const result = reports.length
      ? `${reports.length} fangst${reports.length === 1 ? "" : "er"} · etterregistrert`
      : "Nullfangst · etterregistrert";
    onSave(createSessionRecord(start, end, zoneName, result), reports);
    setStep(4);
  }

  function removeCatch(id: string) {
    setReports((current) => current.filter((report) => report.id !== id));
    setStep(2);
  }

  function selectImage(file?: File) {
    setImageName(file?.name ?? "");
    if (!file) return setImageData("");
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result ?? ""));
    reader.readAsDataURL(file);
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
      imageName,
      length,
      lengthNumber,
      openedAt,
      outcome,
      quota,
      reports,
      species,
      start,
      step,
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
      selectImage,
      setCatchAt,
      setCaught,
      setComment,
      setDate,
      setFrom,
      setLength,
      setOutcome,
      setSpecies,
      setStep,
      setSubzone,
      setTo,
      setTouched,
      setWeight,
      setZone,
      submit,
    },
  };
}

export type PastSessionController = ReturnType<typeof usePastSessionController>;
