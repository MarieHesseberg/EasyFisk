import { useState } from "react";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
  getPrototypePermitDateRange,
} from "@/domain/fishing-permits/get-prototype-permit-availability";

const weekdays = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

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
  const monthLabel = new Intl.DateTimeFormat("nb-NO", {
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
    <section className="permit-sales-calendar" aria-label="Salgskalender">
      <header>
        <button
          type="button"
          aria-label="Forrige måned"
          disabled={currentMonth <= firstMonth}
          onClick={() => moveMonth(-1)}
        >
          ‹
        </button>
        <h3>{monthLabel}</h3>
        <button
          type="button"
          aria-label="Neste måned"
          disabled={currentMonth >= lastMonth}
          onClick={() => moveMonth(1)}
        >
          ›
        </button>
      </header>
      <div className="permit-calendar-grid">
        {weekdays.map((weekday) => (
          <b key={weekday}>{weekday}</b>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = calendarDate(selectedMonth.year, selectedMonth.month, day);
          const availability = getPrototypePermitAvailability(product, date);
          const isInSeason = date >= range.startsOn && date <= range.endsOn;
          const isSelectable = isInSeason && canSelectPrototypePermit(availability);
          return (
            <button
              key={date}
              type="button"
              disabled={!isSelectable}
              className={availability.status}
              aria-pressed={selectedDate === date}
              aria-label={`${day}. ${monthLabel}: ${isInSeason ? availability.label : "Utenfor fiskesesongen"}`}
              onClick={() => setSelectedDate(date)}
            >
              <span>{day}</span>
              {isInSeason && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="permit-calendar-legend" aria-label="Kalenderforklaring">
        <span>
          <i className="available" /> Ledig
        </span>
        <span>
          <i className="low" /> Få igjen
        </span>
        <span>
          <i className="sold-out" /> Utsolgt
        </span>
      </div>
    </section>
  );
}
