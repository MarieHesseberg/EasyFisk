import type { DetailDestination } from "@/domain/navigation/navigation";
import { ControlCardDetail } from "./control-card-detail";
import { DisinfectionDetail } from "./disinfection-detail";
import { FavoriteZonesDetail } from "./favorite-zones-detail";
import { NotificationsDetail } from "./notifications-detail";
import { PermitsDetail } from "./permits-detail";
import { ProfilePrivacyDetail } from "./profile-privacy-detail";

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
    case "notifications":
      return <NotificationsDetail />;
    case "favorite-zones":
      return <FavoriteZonesDetail />;
    case "profile-privacy":
      return <ProfilePrivacyDetail />;
  }
}
