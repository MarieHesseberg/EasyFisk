import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
const { feedback } = appContentRepository.getContent();
export function FeedbackConfirmationStep({ controller }: { controller: FeedbackController }) {
  const { t } = useLanguage();
  return (
    <div className="feedback-confirmation">
      <span>
        <Icon name="check" size={32} />
      </span>
      <small>{t("copy.meldingen.er.sendt.4ce4128")}</small>
      <h3>{t("copy.takk.for.at.du.meldte.fra.21b901a")}</h3>
      <p>
        {feedback.organizationName}{" "}
        {t("copy.har.mottatt.meldingen.du.kan.bruke.referansen.de.85b1e80")}
      </p>
      <div>
        <small>{t("copy.referanse.61b1c01")}</small>
        <b>{feedback.reference}</b>
      </div>
      <button className="primary" onClick={controller.actions.reset}>
        {t("copy.send.en.ny.melding.bb40a14")}
      </button>
    </div>
  );
}
