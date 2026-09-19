/** Kalenderdatoer og lokale klokkeslett følger elvas tidssone, ikke telefonens. */
export const riverTimeZone = "Europe/Oslo";
const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: riverTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addCalendarDays(value: string, days: number) {
  if (!isCalendarDate(value) || !Number.isInteger(days))
    throw new RangeError("Invalid calendar date");
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function riverDateTime(timestamp: number) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(timestamp).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function riverDate(timestamp: number) {
  return riverDateTime(timestamp).slice(0, 10);
}

/**
 * Oppgitt UTC-avvik bestemmer tidspunktet. Uten avvik tolkes verdien som norsk tid.
 * Klokkeslett som ikke finnes om våren avvises. Doble klokkeslett om høsten velger
 * første forekomst, med mulighet for eksplisitt avvisning eller siste forekomst.
 * Rene kalenderdatoer godtas ikke her.
 */
export function parseRiverDateTime(
  value: string,
  ambiguity: "earlier" | "later" | "reject" = "earlier",
): number {
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/.exec(
      value,
    );
  if (!match || !isCalendarDate(match[1])) return NaN;
  const [, date, hours, minutes, seconds = "00", fraction = "", offset] = match;
  if (+hours > 23 || +minutes > 59 || +seconds > 59) return NaN;
  if (offset) {
    if (offset !== "Z" && (+offset.slice(1, 3) > 23 || +offset.slice(4) > 59)) return NaN;
    return Date.parse(`${date}T${hours}:${minutes}:${seconds}.${fraction.padEnd(3, "0")}${offset}`);
  }
  const wall = `${date}T${hours}:${minutes}:${seconds}`;
  const naive = Date.parse(`${wall}Z`);
  const millisecond = Number(fraction.padEnd(3, "0"));
  // Kontroller avvik på begge sider av et norsk tidsskifte og bekreft hver kandidat.
  const offsets = new Set(
    [-36, 0, 36].map((hour) => {
      const sample = naive + hour * 3_600_000;
      return Date.parse(`${riverDateTime(sample)}Z`) - sample;
    }),
  );
  const candidates = [...offsets]
    .map((shift) => naive - shift)
    .filter((instant) => riverDateTime(instant) === wall)
    .sort((a, b) => a - b);
  if (!candidates.length || (ambiguity === "reject" && candidates.length > 1)) return NaN;
  return candidates[ambiguity === "later" ? candidates.length - 1 : 0] + millisecond;
}

/** Rene datoer forblir kalenderdatoer; klokken 12 brukes bare som anker ved visning. */
export function dateForDisplay(value: string): Date {
  return new Date(parseRiverDateTime(isCalendarDate(value) ? `${value}T12:00` : value));
}
