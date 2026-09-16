import type { PermitJourneyProps } from "./permit-journey";
import { ScreenHeader } from "@/components/ui/screen-header";
import type { ZoneId } from "@/domain/zones/zone";
import { PermitShop } from "@/features/fishing-permits/permit-shop";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";

export function PermitShopScreen({
  journey,
  setJourney,
  onZoneChange,
  initialZone,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome,
  onRegisterFee,
  onRegisterDisinfection,
}: PermitJourneyProps & {
  initialZone: ZoneId;
  onPermitPurchased: (zoneId: ZoneId) => void;
  onOpenPermits: () => void;
  onGoHome: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  onRegisterFee: () => void;
  onRegisterDisinfection: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="screen permit-shop-screen">
      <ScreenHeader
        title={t("copy.kj.p.fiskekort.d32ea04")}
        eyebrow={t("copy.dagskort.sesongkort.og.gruppekort.9c08652")}
      />
      <PermitShop
        journey={journey}
        setJourney={setJourney}
        onZoneChange={onZoneChange}
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
