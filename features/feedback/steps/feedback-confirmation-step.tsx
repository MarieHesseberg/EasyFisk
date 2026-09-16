import { Icon } from "@/components/ui/icon";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
export function FeedbackConfirmationStep({ controller }: { controller: FeedbackController }) {
  const { t } = useLanguage();
  return (
    <div className="feedback-confirmation">
      <span>
        <Icon name="check" size={32} />
      </span>
      <small>{t("prototype.feedbackComplete")}</small>
      <h3>{t("copy.takk.for.at.du.meldte.fra.21b901a")}</h3>
      <p>{t("prototype.feedbackNotice")}</p>
      <button className="primary" onClick={controller.actions.reset}>
        {t("copy.send.en.ny.melding.bb40a14")}
      </button>
    </div>
  );
}
