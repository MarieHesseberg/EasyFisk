"use client";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/components/localization/language-provider";
import type { FeedbackMessage } from "@/domain/feedback/feedback-message";
import { formatDateTime } from "@/lib/localization-format";
export function FeedbackImage({ image, name }: { image?: Blob; name?: string }) {
  const { t } = useLanguage();
  const url = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  if (!image || !url) return null;
  // The image is a locally selected attachment, not a remote image.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="feedback-saved-image" src={url} alt={name || t("feedback.imageAlt")} />;
}
export function FeedbackMessageDetail({
  message,
  compact = false,
}: {
  message: FeedbackMessage;
  compact?: boolean;
}) {
  const { language, t } = useLanguage();
  return (
    <div className="feedback-message-detail">
      {!compact && <p className="feedback-message-status">{t("feedback.received")}</p>}
      <p>{t("feedback.localNotice")}</p>
      <dl>
        {!compact && (
          <>
            <div>
              <dt>{t("copy.testreferanse.ed0f389")}</dt>
              <dd>{message.reference}</dd>
            </div>
            <div>
              <dt>{t("feedback.savedAt")}</dt>
              <dd>{formatDateTime(message.createdAt, language)}</dd>
            </div>
            <div>
              <dt>{t("copy.kategori.71dd91c")}</dt>
              <dd>{t(message.category)}</dd>
            </div>
          </>
        )}
        <div>
          <dt>{t("copy.beskrivelse.f3bf7df")}</dt>
          <dd className="feedback-description">{message.description}</dd>
        </div>
        <div>
          <dt>{t("copy.posisjon.7733e25")}</dt>
          <dd>
            {message.position
              ? message.position.map((n) => n.toFixed(5)).join(", ")
              : t("copy.ikke.lagt.ved.5c53303")}
          </dd>
        </div>
      </dl>
      <FeedbackImage image={message.image} name={message.imageName} />
    </div>
  );
}
