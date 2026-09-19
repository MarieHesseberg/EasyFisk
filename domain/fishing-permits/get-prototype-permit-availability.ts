import { isCalendarDate } from "../shared/river-time.ts";
import type { PermitPurchase } from "./permit-purchase.ts";
import { calculatePermitValidity } from "./calculate-permit-validity.ts";
import { getAppDate, getAppNow } from "../shared/app-clock.ts";
import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
import { getZoneSeasonEnd } from "../zones/zone-rules.ts";
import { t, translateContent, type AppLanguage } from "../../locales/index.ts";
import type {
  PrototypePermitAvailability,
  PrototypePermitProduct,
} from "./prototype-permit-product.ts";

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
  now = getAppNow(),
  purchases: readonly PermitPurchase[] = [],
): PrototypePermitAvailability {
  const result = getAvailability(product, fishingDate, purchases);
  const today = getAppDate(now);
  const seasonEnd = getPrototypePermitDateRange(product).endsOn;
  if (
    !["no-fishing-date", "not-on-sale"].includes(result.status) &&
    (seasonEnd < today || (product.type !== "season" && fishingDate < today))
  )
    return { status: "no-fishing-date", label: t(language, "permit.pastDate"), remainingUnits: 0 };
  if (today >= activeFishingRules.currentNotice.publishedDate)
    return { status: "not-on-sale", label: t(language, "permit.salesClosed"), remainingUnits: 0 };
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
  purchases: readonly PermitPurchase[],
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

  const weekday = new Date(`${fishingDate}T12:00:00Z`).getUTCDay();
  if (
    product.validity.excludedDates?.includes(fishingDate) ||
    (product.validity.allowedWeekdays && !product.validity.allowedWeekdays.includes(weekday))
  )
    return { status: "no-fishing-date", label: "Ikke fiskedag i denne sonen", remainingUnits: 0 };
  const capacity = product.capacity.permitsPerFishingDay;
  if (capacity !== undefined) {
    const sold = new Set(
      purchases
        .filter((purchase) => {
          if (
            purchase.productId !== product.id ||
            !["completed", "payment-approved", "issuance-failed"].includes(purchase.status)
          )
            return false;
          try {
            return (purchase.fishingDates ?? [purchase.fishingDate]).some((date) => {
              const validity = calculatePermitValidity(product, date);
              return (
                calculatePermitValidity(product, fishingDate).startsAt <= validity.endsAt &&
                calculatePermitValidity(product, fishingDate).endsAt >= validity.startsAt
              );
            });
          } catch {
            return false;
          }
        })
        .map((purchase) => purchase.id),
    ).size;
    const remainingUnits = Math.max(
      0,
      (stableNumber(`${product.id}:${fishingDate}`) % (capacity + 1)) - sold,
    );
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

  const seasonCapacity = product.capacity.permitsPerSeason;
  if (seasonCapacity !== undefined) {
    const sold = purchases.filter(
      (p) =>
        p.productId === product.id &&
        ["completed", "payment-approved", "issuance-failed"].includes(p.status),
    ).length;
    const remainingUnits = Math.max(0, seasonCapacity - sold);
    return {
      status: remainingUnits ? "available" : "sold-out",
      label: remainingUnits ? `${remainingUnits} kort igjen` : "Utsolgt",
      remainingUnits,
    };
  }
  return { status: "available", label: "", remainingUnits: null };
}

export function canSelectPrototypePermit(availability: PrototypePermitAvailability) {
  return availability.status === "available" || availability.status === "low";
}
