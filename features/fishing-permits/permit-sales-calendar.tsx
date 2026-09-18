import { usePermitPurchases } from "./use-permit-purchases";
import { selectLocalized } from "@/locales";
import { useState } from "react";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
  getPrototypePermitDateRange,
} from "@/domain/fishing-permits/get-prototype-permit-availability";
import { useLanguage } from "@/components/localization/language-provider";
const weekdays = {
  no: ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
} as const;
function calendarDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function monthFromDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month - 1 };
}
export function PermitSalesCalendar({
  product,
  selectedDate,
  setSelectedDate,
}: {
  product: PrototypePermitProduct;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  const { language, t } = useLanguage();
  const { purchases } = usePermitPurchases();
  const range = getPrototypePermitDateRange(product);
  const firstMonth = range.startsOn.slice(0, 7);
  const lastMonth = range.endsOn.slice(0, 7);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.slice(0, 7));
  const selectedMonth = monthFromDate(`${currentMonth}-01`);
  const firstWeekday =
    (new Date(Date.UTC(selectedMonth.year, selectedMonth.month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(selectedMonth.year, selectedMonth.month + 1, 0),
  ).getUTCDate();
  const monthLabel = new Intl.DateTimeFormat(selectLocalized(language, "nb-NO", "en-GB"), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(selectedMonth.year, selectedMonth.month, 1)));
  function moveMonth(offset: number) {
    const next = new Date(Date.UTC(selectedMonth.year, selectedMonth.month + offset, 1));
    const nextMonth = calendarDate(next.getUTCFullYear(), next.getUTCMonth(), 1).slice(0, 7);
    setCurrentMonth(nextMonth);
  }
  return (
    <section className="permit-sales-calendar" aria-label={t("copy.salgskalender.4afb904")}>
      <header>
        <button
          type="button"
          aria-label={t("copy.forrige.maned.e4b11f0")}
          disabled={currentMonth <= firstMonth}
          onClick={() => moveMonth(-1)}
        >
          ‹
        </button>
        <h3>{monthLabel}</h3>
        <button
          type="button"
          aria-label={t("copy.neste.maned.0b31caa")}
          disabled={currentMonth >= lastMonth}
          onClick={() => moveMonth(1)}
        >
          ›
        </button>
      </header>
      <div className="permit-calendar-grid">
        {weekdays[language].map((weekday) => (
          <b key={weekday}>{weekday}</b>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = calendarDate(selectedMonth.year, selectedMonth.month, day);
          const availability = getPrototypePermitAvailability(
            product,
            date,
            language,
            undefined,
            purchases,
          );
          const isInSeason = date >= range.startsOn && date <= range.endsOn;
          const isSelectable = isInSeason && canSelectPrototypePermit(availability);
          return (
            <button
              key={date}
              type="button"
              disabled={!isSelectable}
              className={availability.status}
              aria-pressed={selectedDate === date}
              aria-label={`${day}. ${monthLabel}: ${t(isInSeason ? availability.label : "Utenfor fiskesesongen")}`}
              onClick={() => setSelectedDate(date)}
            >
              <span>{day}</span>
              {isInSeason && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="permit-calendar-legend" aria-label={t("copy.kalenderforklaring.35b0219")}>
        <span>
          <i className="available" />
          {t("copy.ledig.26d52d2")}
        </span>
        <span>
          <i className="low" />
          {t("copy.fa.igjen.3629356")}
        </span>
        <span>
          <i className="sold-out" />
          {t("copy.utsolgt.b24d822")}
        </span>
      </div>
    </section>
  );
}
