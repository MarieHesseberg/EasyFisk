import { FeedbackForm } from "@/features/feedback/feedback-form";
import { MoreDetailContent } from "@/features/profile/more-detail-content";
import { RuleCenter } from "@/features/rules/rule-center";

export function Detail({ title, close }: { title: string; close: () => void }) {
  return (
    <div className="detail-page">
      <button className="back" onClick={close}>
        ‹ Tilbake
      </button>
      <small>PROTOTYPEVISNING</small>
      <h2>{title}</h2>
      {title.includes("Fiskeregler") ? (
        <RuleCenter />
      ) : title === "Tilbakemelding" ? (
        <FeedbackForm />
      ) : (
        <MoreDetailContent title={title} />
      )}
      {title.includes("Fiskeregler") && (
        <p className="source-note">
          Regler og sonedata er basert på Mandalselva Elveeigarlags publiserte informasjon for 2026.
          Fysisk skilting og siste publiserte regelendring gjelder.
        </p>
      )}
    </div>
  );
}
