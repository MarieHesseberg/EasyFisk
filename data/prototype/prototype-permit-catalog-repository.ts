import type { PermitCatalogRepository } from "@/data/contracts/permit-catalog-repository";
import { prototypePermitProducts } from "@/data/prototype/mandalselva-permit-products";

export const prototypePermitCatalogRepository: PermitCatalogRepository = {
  listProducts: () => prototypePermitProducts,
  listProductsByZone: (zoneId) =>
    prototypePermitProducts.filter((product) => product.zoneId === zoneId),
  findProduct: (productId) => prototypePermitProducts.find((product) => product.id === productId),
};
