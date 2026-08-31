import { ScreenHeader } from "@/components/ui/screen-header";
import type { ZoneId } from "@/domain/zones/zone";
import { PermitShop } from "@/features/fishing-permits/permit-shop";

export function PermitShopScreen({
  initialZone,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
}: {
  initialZone: ZoneId;
  onPermitPurchased: (zoneId: ZoneId) => void;
  onOpenPermits: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="screen permit-shop-screen">
      <ScreenHeader title="Kjøp fiskekort" eyebrow="DAGSKORT, SESONGKORT OG GRUPPEKORT" />
      <PermitShop
        initialZone={initialZone}
        onPermitPurchased={onPermitPurchased}
        onOpenPermits={onOpenPermits}
        onGoHome={onGoHome}
      />
    </div>
  );
}
