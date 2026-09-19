"use client";
import { useCallback, useEffect, useState } from "react";
import { useAppServices } from "@/data/runtime/services-provider";
import { useRepositoryQuery } from "@/hooks/use-repository-query";
import type { PermitPurchase } from "@/domain/fishing-permits/permit-purchase";
import { technicalOperationFailed } from "@/domain/shared/operation-result";
export function usePermitPurchases() {
  const { purchases: repository } = useAppServices();
  const [writeError, setWriteError] = useState("");
  const read = useCallback(async () => {
    const result = await repository.list();
    if (!result.ok) throw new Error(result.error);
    return result.value;
  }, [repository]);
  const query = useRepositoryQuery<PermitPurchase[]>(read, []);
  const { reload } = query;
  useEffect(() => {
    const refresh = () => {
      void reload();
    };
    window.addEventListener("easyfisk-purchases-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("easyfisk-purchases-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [reload]);
  async function write(action: () => ReturnType<typeof repository.clear>) {
    try {
      const result = await action();
      setWriteError(result.ok ? "" : result.error);
      if (result.ok) window.dispatchEvent(new Event("easyfisk-purchases-changed"));
      return result;
    } catch (cause) {
      const result = technicalOperationFailed("storage.write", cause);
      if (!result.ok) setWriteError(result.error);
      return result;
    }
  }
  return {
    purchases: query.data,
    error: writeError || query.error,
    loading: query.loading,
    reload,
    save: (purchase: PermitPurchase) => write(() => repository.save(purchase)),
    clear: () => write(() => repository.clear()),
  };
}
