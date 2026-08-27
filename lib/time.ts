export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatClock(time: number | null): string {
  if (!time) return "--:--";

  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(time));
}

export function formatLongDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours) return `${hours} t ${minutes} min`;
  if (minutes) return `${minutes} min ${remainingSeconds} sek`;
  return `${remainingSeconds} sek`;
}
