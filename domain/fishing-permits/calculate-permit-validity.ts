import type { PrototypePermitProduct } from "./prototype-permit-product.ts";

export type PermitValidityPeriod = {
  startsAt: string;
  endsAt: string;
};

function parseCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Fiskedatoen må ha formatet ÅÅÅÅ-MM-DD.");

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new RangeError("Fiskedatoen finnes ikke i kalenderen.");

  return date;
}

function addCalendarDays(value: string, days: number) {
  const date = parseCalendarDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Beregner kortets lokale gyldighetstid i Mandalselva uten å være avhengig av enhetens tidssone. */
export function calculatePermitValidity(
  product: PrototypePermitProduct,
  selectedDate: string,
): PermitValidityPeriod {
  parseCalendarDate(selectedDate);

  if (product.type === "season") {
    const { seasonStartsOn, seasonEndsOn } = product.validity;
    if (!seasonStartsOn || !seasonEndsOn)
      throw new RangeError("Sesongkortet mangler sesongstart eller sesongslutt.");
    parseCalendarDate(seasonStartsOn);
    parseCalendarDate(seasonEndsOn);
    return {
      startsAt: `${seasonStartsOn}T00:00`,
      endsAt: `${seasonEndsOn}T23:59`,
    };
  }

  if (product.type === "week") {
    return {
      startsAt: `${selectedDate}T00:00`,
      endsAt: `${addCalendarDays(selectedDate, 6)}T23:59`,
    };
  }

  const startsAt = product.validity.startsAt ?? "00:00";
  const endsAt = product.validity.endsAt ?? "23:59";
  const endsOn = endsAt < startsAt ? addCalendarDays(selectedDate, 1) : selectedDate;
  return {
    startsAt: `${selectedDate}T${startsAt}`,
    endsAt: `${endsOn}T${endsAt}`,
  };
}
