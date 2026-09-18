import type { FishingDocument } from "../documents/fishing-document.ts";
import { getPermitZoneId } from "../documents/get-permit-zones.ts";
import type { PrototypePermitProduct } from "../fishing-permits/prototype-permit-product.ts";
import { getSubzones, getZoneSeasonEnd, getZoneSeasonLabel } from "../zones/zone-rules.ts";

/** Exact area matching prevents neighbouring subzones from sharing personal rules. */
export function getPersonalPermitContext(
  permit: FishingDocument,
  products: readonly PrototypePermitProduct[],
) {
  const zone = getPermitZoneId(permit);
  if (!zone) return undefined;
  const area = permit.values.area ?? "";
  const matches = products.filter(
    (product) =>
      product.zoneId === zone &&
      (area === product.areaName || area === `Mandalselva · Sone ${zone} · ${product.areaName}`),
  );
  const categories: Record<string, string> = {
    day: "Døgnkort",
    week: "Ukekort",
    season: "Sesongkort",
    group: "Gruppekort",
    boat: "Annet",
    reporting: "Annet",
  };
  const product = matches.find((item) => categories[item.type] === permit.values.category);
  const areaName = product?.areaName ?? area.split(" · ").at(-1) ?? "";
  const subzone =
    getSubzones(zone).find(
      (name) => name.toLocaleLowerCase("nb") === areaName.toLocaleLowerCase("nb"),
    ) ?? areaName;
  return {
    zone,
    areaName,
    product,
    seasonEnd: getZoneSeasonEnd(zone, subzone),
    seasonLabel: getZoneSeasonLabel(zone, subzone),
  };
}
