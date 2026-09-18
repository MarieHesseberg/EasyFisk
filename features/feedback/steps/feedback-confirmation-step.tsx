import { FeedbackMessageDetail } from "../feedback-message-detail";
import { Icon } from "@/components/ui/icon";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
export function FeedbackConfirmationStep({
  controller,
  openHistory,
}: {
  controller: FeedbackController;
  openHistory: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="feedback-confirmation">
      <span>
        <Icon name="check" size={32} />
      </span>
      <small>{t("prototype.feedbackComplete")}</small>
      <h3>{t("copy.takk.for.at.du.meldte.fra.21b901a")}</h3>
      {controller.state.receipt && <FeedbackMessageDetail message={controller.state.receipt} />}
      <button className="primary" onClick={openHistory}>
        {t("feedback.openHistory")}
      </button>
      <button className="secondary" onClick={controller.actions.reset}>
        {t("copy.send.en.ny.melding.bb40a14")}
      </button>
    </div>
  );
}
