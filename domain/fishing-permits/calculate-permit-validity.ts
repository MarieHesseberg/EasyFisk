import { isCalendarDate, addCalendarDays } from "../shared/river-time.ts";
import type { PrototypePermitProduct } from "./prototype-permit-product.ts";

export type PermitValidityPeriod = {
  startsAt: string;
  endsAt: string;
};

function parseCalendarDate(value: string) {
  if (!isCalendarDate(value)) throw new RangeError("Fiskedatoen finnes ikke i kalenderen.");
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
  const seasonEnd = product.validity.seasonEndsOn;
  return {
    startsAt: `${selectedDate}T${startsAt}`,
    endsAt: seasonEnd && endsOn > seasonEnd ? `${seasonEnd}T23:59` : `${endsOn}T${endsAt}`,
  };
}
