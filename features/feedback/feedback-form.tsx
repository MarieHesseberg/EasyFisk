"use client";
import { DraftScope, DraftControls } from "@/hooks/use-draft";

import { useState } from "react";
import { useLanguage } from "@/components/localization/language-provider";
import { FeedbackHistory } from "./feedback-history";
import { useFeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { FeedbackConfirmationStep } from "@/features/feedback/steps/feedback-confirmation-step";
import { FeedbackDetailsStep } from "@/features/feedback/steps/feedback-details-step";
import { FeedbackReviewStep } from "@/features/feedback/steps/feedback-review-step";

function FeedbackFormContent({ initialView = "new" }: { initialView?: "new" | "history" }) {
  const [view, setView] = useState(initialView);
  const { t } = useLanguage();
  const controller = useFeedbackController();
  const { step } = controller.state;
  return (
    <div className="feedback-form">
      <div className="feedback-view-switcher">
        <button aria-pressed={view === "new"} onClick={() => setView("new")}>
          {t("feedback.new")}
        </button>
        <button aria-pressed={view === "history"} onClick={() => setView("history")}>
          {t("feedback.mine")}
        </button>
      </div>
      {view === "new" && step < 3 && <DraftControls disabled={controller.state.isSubmitting} />}
      {view === "history" ? (
        <FeedbackHistory />
      ) : step === 3 ? (
        <FeedbackConfirmationStep controller={controller} openHistory={() => setView("history")} />
      ) : (
        <>
          <div className="feedback-steps">
            <span className="on">1</span>
            <i />
            <span className={step >= 2 ? "on" : ""}>2</span>
            <i />
            <span>3</span>
          </div>
          {step === 1 && <FeedbackDetailsStep controller={controller} />}
          {step === 2 && <FeedbackReviewStep controller={controller} />}
        </>
      )}
    </div>
  );
}

export function FeedbackForm(props: Parameters<typeof FeedbackFormContent>[0]) {
  const id = "feedback";
  return (
    <DraftScope key={id} id={id}>
      <FeedbackFormContent {...props} />
    </DraftScope>
  );
}
