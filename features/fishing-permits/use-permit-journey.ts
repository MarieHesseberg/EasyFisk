"use client";
import { useEffect, useState, useRef, type SetStateAction } from "react";
import { createPermitJourney, type PermitJourney } from "./permit-journey";
import type { ZoneId } from "@/domain/zones/zone";
const key = "easyfisk-permit-journey-v1";
export function usePermitJourney(zone: ZoneId, enabled = true) {
  const [journey, setJourney] = useState(() => createPermitJourney(zone));
  const current = useRef(journey);
  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (
        saved &&
        [1, 2, 3, 4].includes(saved.selectedZone) &&
        typeof saved.selectedArea === "string" &&
        typeof saved.selectedDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(saved.selectedDate) &&
        (saved.selectedProductId === null || typeof saved.selectedProductId === "string")
      ) {
        current.current = {
          ...current.current,
          selectedZone: saved.selectedZone,
          selectedArea: saved.selectedArea,
          selectedDate: saved.selectedDate,
          selectedProductId: saved.selectedProductId,
          isProductActionOpen: saved.isProductActionOpen === true,
        };
        setJourney(current.current);
      }
    } catch {
      /* Form drafts remain available independently. */
    }
  }, [enabled]);
  function update(action: SetStateAction<PermitJourney>) {
    const next = typeof action === "function" ? action(current.current) : action;
    current.current = next;
    setJourney(next);
    if (enabled)
      try {
        const { selectedZone, selectedArea, selectedDate, selectedProductId, isProductActionOpen } =
          next;
        localStorage.setItem(
          key,
          JSON.stringify({
            selectedZone,
            selectedArea,
            selectedDate,
            selectedProductId,
            isProductActionOpen: next.receipts[`${selectedProductId}:${selectedDate}`]
              ? false
              : isProductActionOpen,
          }),
        );
      } catch {
        /* Each form reports its own draft storage errors. */
      }
  }
  return [journey, update] as const;
}
