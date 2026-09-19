import { parseRiverDateTime } from "@/domain/shared/river-time";
import Image from "next/image";
import river from "@/public/illustrations/river.png";
import landscape from "@/public/illustrations/permit-landscape.png";
import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { useCurrentTime } from "@/hooks/use-current-time";
import { isPermitValid } from "@/domain/documents/get-permit-zones";
import { selectLocalized } from "@/locales";

/** A visual preview of an existing document, not a determination of its validity. */
export function HomePermitHero({
  permit,
  openPermits,
  previewZone,
}: {
  permit?: FishingDocument;
  previewZone?: string;
  openPermits: () => void;
}) {
  const { language, t } = useLanguage();
  const now = useCurrentTime();
  if (!permit && !previewZone)
    return (
      <Image
        className="home-river"
        src={river}
        alt=""
        priority
        sizes="(max-width: 600px) 100vw, 400px"
      />
    );

  const [water, ...area] = (
    permit?.values.area ||
    (previewZone ? `Mandalselva · ${previewZone}` : "") ||
    selectLocalized(language, "Mitt fiskekort", "My fishing permit")
  ).split(/\s*·\s*/);

  const startsAt = parseRiverDateTime(permit?.values.startsAt ?? "");
  const endsAt = parseRiverDateTime(permit?.values.endsAt ?? "");
  const badge = !permit
    ? selectLocalized(language, "Testvisning", "Test preview")
    : startsAt > now
      ? selectLocalized(language, "Kommende", "Upcoming")
      : endsAt < now
        ? selectLocalized(language, "Utløpt", "Expired")
        : isPermitValid(permit, now)
          ? selectLocalized(language, "I dag", "Today")
          : selectLocalized(language, "Fiskekort", "Fishing permit");
  const subtitle = [area[0], permit?.values.category && t(permit.values.category)]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      className="home-owned-permits home-ticket"
      onClick={openPermits}
      aria-label={selectLocalized(language, "Mine fiskekort", "My permits")}
    >
      <span className="home-ticket-main">
        <Image src={landscape} alt="" className="home-ticket-landscape" sizes="200px" priority />
        <span className="home-ticket-copy">
          <span className="home-ticket-label">{badge}</span>
          <strong>{water}</strong>
          {subtitle && <span>{subtitle}</span>}
          {permit?.forOtherPerson && permit.values.holder && <small>{permit.values.holder}</small>}
        </span>
      </span>
      <span className="home-ticket-footer">
        <span>{selectLocalized(language, "Mine fiskekort", "My permits")}</span>
        <Icon name="chevron" size={21} />
      </span>
    </button>
  );
}
