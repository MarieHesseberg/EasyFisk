import { ScreenHeader } from "@/components/ui/screen-header";
import type { ZoneId } from "@/domain/zones/zone";
import { PermitShop } from "@/features/fishing-permits/permit-shop";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";

export function PermitShopScreen({
  initialZone,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome,
  onRegisterFee,
  onRegisterDisinfection,
}: {
  initialZone: ZoneId;
  onPermitPurchased: (zoneId: ZoneId) => void;
  onOpenPermits: () => void;
  onGoHome: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  onRegisterFee: () => void;
  onRegisterDisinfection: () => void;
}) {
  return (
    <div className="screen permit-shop-screen">
      <ScreenHeader title="Kjøp fiskekort" eyebrow="DAGSKORT, SESONGKORT OG GRUPPEKORT" />
      <PermitShop
        initialZone={initialZone}
        onPermitPurchased={onPermitPurchased}
        onOpenPermits={onOpenPermits}
        onGoHome={onGoHome}
        paymentOutcome={paymentOutcome}
        onRegisterFee={onRegisterFee}
        onRegisterDisinfection={onRegisterDisinfection}
      />
    </div>
  );
}
