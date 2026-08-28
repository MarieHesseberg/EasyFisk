"use client";

import { useFeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { FeedbackConfirmationStep } from "@/features/feedback/steps/feedback-confirmation-step";
import { FeedbackDetailsStep } from "@/features/feedback/steps/feedback-details-step";
import { FeedbackReviewStep } from "@/features/feedback/steps/feedback-review-step";

export function FeedbackForm() {
  const controller = useFeedbackController();
  const { step } = controller.state;
  if (step === 3) return <FeedbackConfirmationStep controller={controller} />;
  return (
    <div className="feedback-form">
      <div className="feedback-steps">
        <span className="on">1</span>
        <i />
        <span className={step >= 2 ? "on" : ""}>2</span>
        <i />
        <span>3</span>
      </div>
      {step === 1 && <FeedbackDetailsStep controller={controller} />}
      {step === 2 && <FeedbackReviewStep controller={controller} />}
    </div>
  );
}
