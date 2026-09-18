"use client";
import { useEffect, useState } from "react";
import { feedbackRepository } from "@/data/repositories/feedback";
import type { FeedbackMessage } from "@/domain/feedback/feedback-message";
import { useLanguage } from "@/components/localization/language-provider";
import { formatDateTime } from "@/lib/localization-format";
import { FeedbackMessageDetail } from "./feedback-message-detail";
export function FeedbackHistory() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    feedbackRepository.list().then(
      (records) => {
        if (active) {
          setMessages(records);
          setError(false);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <section className="feedback-history" aria-label={t("feedback.mine")}>
      {loading && <p role="status">{t("feedback.loading")}</p>}
      {error && (
        <div role="alert">
          <p>{t("feedback.loadError")}</p>
          <button
            className="secondary"
            onClick={() => {
              setLoading(true);
              setRevision((n) => n + 1);
            }}
          >
            {t("copy.pr.v.igjen.0a31d71")}
          </button>
        </div>
      )}
      {!loading && !error && !messages.length && <p>{t("feedback.empty")}</p>}
      {!error &&
        messages.map((message) => (
          <details key={message.id} className="feedback-history-item">
            <summary>
              <strong>{t(message.category)}</strong>
              <span>{formatDateTime(message.createdAt, language)}</span>
              <span>{message.reference}</span>
              <span className="feedback-message-status">{t("feedback.received")}</span>
            </summary>
            <FeedbackMessageDetail message={message} compact />
          </details>
        ))}
    </section>
  );
}
