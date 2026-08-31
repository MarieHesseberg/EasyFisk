import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
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
    startsOn: activeFishingRules.season.startDate,
    endsOn:
      product.zoneId === activeFishingRules.season.extendedZoneId
        ? activeFishingRules.season.extendedEndDate
        : activeFishingRules.season.standardEndDate,
  };
}

/** Lager stabil, simulert tilgjengelighet for ett produkt og én fiskedato. */
export function getPrototypePermitAvailability(
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
