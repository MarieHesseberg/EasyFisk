"use client";

import { useEffect, useState } from "react";
import { createLocalStoragePermitPurchaseRepository } from "@/data/local-storage/create-local-storage-permit-purchase-repository";
import type { PermitPurchase } from "@/domain/fishing-permits/permit-purchase";

export function usePermitPurchases() {
  const [purchases, setPurchases] = useState<PermitPurchase[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = createLocalStoragePermitPurchaseRepository(window.localStorage).list();
      if (result.ok) setPurchases(result.value);
      else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, []);
  function save(purchase: PermitPurchase) {
    const repository = createLocalStoragePermitPurchaseRepository(window.localStorage);
    const result = repository.save(purchase);
    if (result.ok) {
      const refreshed = repository.list();
      if (refreshed.ok) setPurchases(refreshed.value);
      setError("");
    } else setError(result.error);
    return result;
  }
  function clear() {
    const result = createLocalStoragePermitPurchaseRepository(window.localStorage).clear();
    if (result.ok) {
      setPurchases([]);
      setError("");
    } else setError(result.error);
    return result;
  }
  return { purchases, error, save, clear };
}
