import type { DetailDestination } from "@/domain/navigation/navigation";
import { ControlCardDetail } from "./control-card-detail";
import { DisinfectionDetail } from "./disinfection-detail";
import { NotificationsDetail } from "./notifications-detail";
import { PermitsDetail } from "./permits-detail";
import { ProfilePrivacyDetail } from "./profile-privacy-detail";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import { fishingContentRepository } from "@/data/repositories/fishing-content";

export function ProfileDetailContent({
  destination,
  testReadiness,
}: {
  destination: Exclude<DetailDestination, "feedback">;
  testReadiness?: DocumentReadiness;
}) {
  const testDocuments = fishingContentRepository.getDemoDocuments();
  const testDocument = (kind: "permit" | "disinfection" | "fee") =>
    testReadiness === undefined
      ? undefined
      : testReadiness.valid[kind]
        ? testDocuments[kind]
        : null;
  switch (destination) {
    case "control-card":
      return <ControlCardDetail testReadiness={testReadiness} />;
    case "permits":
      return <PermitsDetail testDocument={testDocument("permit")} />;
    case "disinfection":
      return <DisinfectionDetail testDocument={testDocument("disinfection")} />;
    case "fee":
      return <DocumentsPanel kind="fee" testDocument={testDocument("fee")} />;
    case "notifications":
      return <NotificationsDetail />;
    case "profile-privacy":
      return <ProfilePrivacyDetail />;
  }
}
