import { AppDialogPortal } from "@/components/ui/app-dialog-portal";
import { localizeZoneName } from "@/lib/localize-zone-name";
import { localizeSessionResult } from "@/lib/localize-session-result";
import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function SessionHistoryDetail({
  catches,
  onClose,
  session,
}: {
  catches: CatchRecord[];
  onClose: () => void;
  session: SessionRecord;
}) {
  const { language, t } = useLanguage();
  const dateFormatter = new Intl.DateTimeFormat(selectLocalized(language, "nb-NO", "en-GB"), {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dialogRef = useDialogAccessibility(onClose);
  return (
    <AppDialogPortal>
      <div className="modal-bg" onClick={onClose}>
        <div
          ref={dialogRef}
          className="catch-modal session-history-detail"
          role="dialog"
          aria-modal="false"
          aria-label={t("copy.detaljer.for.fiske.kt.30d5863")}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="modal-close"
            aria-label={t("copy.lukk.ktdetaljer.bdf38e9")}
            onClick={onClose}
          >
            ×
          </button>
          <small>{t("copy.fiske.kt.5ee0c6f")}</small>
          <h2>{dateFormatter.format(new Date(session.end))}</h2>

          <div className="detail-data">
            <p>
              <span>{t("copy.sone.44f1e2e")}</span>
              <b>{localizeZoneName(session.zone, language)}</b>
            </p>
            <p>
              <span>{t("copy.tidspunkt.83ee898")}</span>
              <b>
                {formatClock(session.start, language)}–{formatClock(session.end, language)}
              </b>
            </p>
            <p>
              <span>{t("copy.varighet.a0cec10")}</span>
              <b>{formatLongDuration(session.duration, language)}</b>
            </p>
            <p>
              <span>{t("copy.resultat.c9f6c1d")}</span>
              <b>{localizeSessionResult(session.result, language)}</b>
            </p>
          </div>

          <h3>{t("copy.fangster.i.kten.baf1d73")}</h3>
          {catches.length === 0 ? (
            <div className="session-catch-empty">
              <Icon name="fish" size={20} /> {t("copy.ingen.fangster.registrert.3874954")}
            </div>
          ) : (
            <div className="session-catch-list">
              {catches.map((record) => (
                <p key={record.id}>
                  <b>{t(record.species)}</b>
                  <span>
                    {t(record.result)} · {record.length} cm ·{" "}
                    {selectLocalized(
                      language,
                      String(record.weight).replace(".", ","),
                      String(record.weight),
                    )}{" "}
                    kg
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppDialogPortal>
  );
}
