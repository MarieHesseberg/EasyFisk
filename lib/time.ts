export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatClock(time: number | null, language: AppLanguage = "no"): string {
  if (!time) return "--:--";
  return formatTime(time, language);
}

export function formatLongDuration(seconds: number, language: AppLanguage = "no"): string {
  return formatDurationValue(seconds, language);
}
import type { AppLanguage } from "@/locales";
import { formatDurationValue, formatTime } from "@/lib/localization-format";
