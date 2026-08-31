import { FeedbackForm } from "@/features/feedback/feedback-form";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { detailTitles } from "@/features/profile/detail-pages/detail-page-types";
import { ProfileDetailContent } from "@/features/profile/detail-pages/profile-detail-content";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import { AppDialogPortal } from "@/components/ui/app-dialog-portal";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { ZoneId } from "@/domain/zones/zone";

export function ProfileDetailDialog({
  destination,
  close,
  testReadiness,
  openPermitShop,
  selectedZone,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
}: {
  destination: DetailDestination;
  close: () => void;
  testReadiness?: DocumentReadiness;
  openPermitShop?: () => void;
  selectedZone?: ZoneId;
  onPermitPurchased?: (zoneId: ZoneId) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
}) {
  const dialogRef = useDialogAccessibility(close);
  const title = detailTitles[destination];
  return (
    <AppDialogPortal>
      <div
        ref={dialogRef}
        className="detail-page"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
      >
        <button className="back" onClick={close}>
          ‹ Tilbake
        </button>
        <small>PROTOTYPEVISNING</small>
        <h2 id="detail-title">{title}</h2>
        {destination === "feedback" ? (
          <FeedbackForm />
        ) : (
          <ProfileDetailContent
            destination={destination}
            testReadiness={testReadiness}
            openPermitShop={openPermitShop}
            selectedZone={selectedZone}
            onPermitPurchased={onPermitPurchased}
            onOpenPermits={onOpenPermits}
            onGoHome={onGoHome}
          />
        )}
      </div>
    </AppDialogPortal>
  );
}
