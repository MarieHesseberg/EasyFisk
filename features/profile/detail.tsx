import { FeedbackForm } from "@/features/feedback/feedback-form";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { detailTitles } from "@/features/profile/detail-pages/detail-page-types";
import { ProfileDetailContent } from "@/features/profile/detail-pages/profile-detail-content";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function Detail({
  destination,
  close,
}: {
  destination: DetailDestination;
  close: () => void;
}) {
  const dialogRef = useDialogAccessibility(close);
  const title = detailTitles[destination];
  return (
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
        <ProfileDetailContent destination={destination} />
      )}
    </div>
  );
}
