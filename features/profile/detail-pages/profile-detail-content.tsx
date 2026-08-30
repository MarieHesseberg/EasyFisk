import type { DetailDestination } from "@/domain/navigation/navigation";
import { ControlCardDetail } from "./control-card-detail";
import { DisinfectionDetail } from "./disinfection-detail";
import { FavoriteZonesDetail } from "./favorite-zones-detail";
import { NotificationsDetail } from "./notifications-detail";
import { PermitsDetail } from "./permits-detail";
import { ProfilePrivacyDetail } from "./profile-privacy-detail";
import { DocumentsPanel } from "@/features/documents/documents-panel";

export function ProfileDetailContent({
  destination,
}: {
  destination: Exclude<DetailDestination, "feedback">;
}) {
  switch (destination) {
    case "control-card":
      return <ControlCardDetail />;
    case "permits":
      return <PermitsDetail />;
    case "disinfection":
      return <DisinfectionDetail />;
    case "fee":
      return <DocumentsPanel kind="fee" />;
    case "notifications":
      return <NotificationsDetail />;
    case "favorite-zones":
      return <FavoriteZonesDetail />;
    case "profile-privacy":
      return <ProfilePrivacyDetail />;
  }
}
