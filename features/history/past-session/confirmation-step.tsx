import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { useLanguage } from "@/components/localization/language-provider";
export function ConfirmationStep({
  controller,
  onClose,
}: {
  controller: PastSessionController;
  onClose: () => void;
}) {
  const { language, t } = useLanguage();
  const { from, reports, start, to } = controller.state;
  return (
    <>
      <div className="sent-icon">
        <Icon name="check" size={32} />
      </div>
      <small>{t("copy.etterregistreringen.er.sendt.8bdc195")}</small>
      <h2>{t("copy.tur.og.fangster.er.registrert.6457353")}</h2>
      <p className="sent-lead">{t("history.previousTripSaved")}</p>
      <div className="report-id">
        <small>{t("copy.kt.2f297d2")}</small>
        <b>
          {new Intl.DateTimeFormat(selectLocalized(language, "nb-NO", "en-GB"), {
            day: "2-digit",
            month: "long",
          }).format(new Date(start))}{" "}
          · {from}–{to}
        </b>
      </div>
      {reports.map((x, i) => (
        <div className="report-id" key={x.id}>
          <small>
            {t("copy.rapport.id.4b4e7b0")} · {t("copy.fangst.31f8f71")} {i + 1}
          </small>
          <b>{x.id}</b>
        </div>
      ))}
      <button className="primary" onClick={onClose}>
        {t("copy.apne.historikken.676543a")}
      </button>
    </>
  );
}
