import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { ZoneId } from "@/domain/zones/zone";

/** Datatilgangen kart og fremtidig kjøpsflyt bruker for fiskekortprodukter. */
export interface PermitCatalogRepository {
  listProducts(): readonly PrototypePermitProduct[];
  listProductsByZone(zoneId: ZoneId): readonly PrototypePermitProduct[];
  findProduct(productId: string): PrototypePermitProduct | undefined;
}
