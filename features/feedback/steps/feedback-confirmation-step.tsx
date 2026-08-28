import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
const { feedback } = appContentRepository.getContent();
export function FeedbackConfirmationStep({ controller }: { controller: FeedbackController }) {
  return (
    <div className="feedback-confirmation">
      <span>
        <Icon name="check" size={32} />
      </span>
      <small>MELDINGEN ER SENDT</small>
      <h3>Takk for at du meldte fra</h3>
      <p>
        {feedback.organizationName} har mottatt meldingen. Du kan bruke referansen dersom du
        kontakter laget senere.
      </p>
      <div>
        <small>REFERANSE</small>
        <b>{feedback.reference}</b>
      </div>
      <button className="primary" onClick={controller.actions.reset}>
        Send en ny melding
      </button>
    </div>
  );
}
