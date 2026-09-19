"use client";
import { useAppServices } from "@/data/runtime/services-provider";
import { useRepositoryQuery } from "@/hooks/use-repository-query";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
export function usePermitCatalog() {
  const { catalog } = useAppServices();
  return useRepositoryQuery<readonly PrototypePermitProduct[]>(catalog.listProducts, []);
}
