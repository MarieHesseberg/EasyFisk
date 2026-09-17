import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
import { getZoneSeasonEnd } from "../zones/zone-rules.ts";
import { t, translateContent, type AppLanguage } from "../../locales/index.ts";
import type {
  PrototypePermitAvailability,
  PrototypePermitProduct,
} from "./prototype-permit-product.ts";

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function stableNumber(value: string) {
  return Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function getPrototypePermitDateRange(product: PrototypePermitProduct) {
  if (product.type === "season") {
    return {
      startsOn: product.validity.seasonStartsOn ?? activeFishingRules.season.startDate,
      endsOn: product.validity.seasonEndsOn ?? activeFishingRules.season.standardEndDate,
    };
  }
  return {
    startsOn: product.validity.seasonStartsOn ?? activeFishingRules.season.startDate,
    endsOn: product.validity.seasonEndsOn ?? getZoneSeasonEnd(product.zoneId, product.areaName),
  };
}

/** Lager stabil, simulert tilgjengelighet for ett produkt og én fiskedato. */
export function getPrototypePermitAvailability(
  product: PrototypePermitProduct,
  fishingDate: string,
  language: AppLanguage = "no",
): PrototypePermitAvailability {
  const result = getAvailability(product, fishingDate);
  if (language === "no") return result;
  const season = getPrototypePermitDateRange(product);
  let label = translateContent(language, result.label);
  if (isCalendarDate(fishingDate)) {
    if (fishingDate.slice(0, 4) > season.endsOn.slice(0, 4))
      label = t(language, "permit.salesNotOpen", { year: fishingDate.slice(0, 4) });
    else if (fishingDate < season.startsOn)
      label = t(language, "permit.seasonStarts", {
        date: season.startsOn.split("-").reverse().join("."),
      });
    else if (fishingDate > season.endsOn)
      label = t(language, "permit.seasonEnded", {
        date: season.endsOn.split("-").reverse().join("."),
      });
    else if (result.remainingUnits && result.remainingUnits > 0)
      label = t(
        language,
        result.remainingUnits === 1 ? "permit.oneRemaining" : "permit.remaining",
        { count: result.remainingUnits },
      );
  }
  return { ...result, label };
}

function getAvailability(
  product: PrototypePermitProduct,
  fishingDate: string,
): PrototypePermitAvailability {
  if (!isCalendarDate(fishingDate)) {
    return { status: "no-fishing-date", label: "Velg en gyldig fiskedato", remainingUnits: 0 };
  }

  const season = getPrototypePermitDateRange(product);
  if (fishingDate.slice(0, 4) > season.endsOn.slice(0, 4)) {
    return {
      status: "not-on-sale",
      label: `Salget for ${fishingDate.slice(0, 4)} er ikke åpnet`,
      remainingUnits: null,
    };
  }
  if (fishingDate < season.startsOn) {
    return {
      status: "no-fishing-date",
      label: `Fiskesesongen starter ${season.startsOn.split("-").reverse().join(".")}`,
      remainingUnits: 0,
    };
  }
  if (fishingDate > season.endsOn) {
    return {
      status: "no-fishing-date",
      label: `Fiskesesongen sluttet ${season.endsOn.split("-").reverse().join(".")}`,
      remainingUnits: 0,
    };
  }

  const capacity = product.capacity.permitsPerFishingDay;
  if (capacity) {
    const remainingUnits = stableNumber(`${product.id}:${fishingDate}`) % (capacity + 1);
    if (remainingUnits === 0)
      return { status: "sold-out", label: "Utsolgt denne datoen", remainingUnits: 0 };
    if (remainingUnits === 1)
      return { status: "low", label: "1 kort igjen denne datoen", remainingUnits: 1 };
    return {
      status: "available",
      label: `${remainingUnits} kort igjen denne datoen`,
      remainingUnits,
    };
  }

  const simulatedState = stableNumber(`${product.id}:${fishingDate}`) % 10;
  if (simulatedState === 0)
    return { status: "sold-out", label: "Utsolgt denne datoen", remainingUnits: 0 };
  if (simulatedState === 1)
    return { status: "low", label: "Få kort igjen denne datoen", remainingUnits: null };
  return { status: "available", label: "Ledig denne datoen", remainingUnits: null };
}

export function canSelectPrototypePermit(availability: PrototypePermitAvailability) {
  return availability.status === "available" || availability.status === "low";
}
