"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/localization/language-provider";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { Icon } from "@/components/ui/icon";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function TestGuide({
  onShowLocation,
  onComplete,
}: {
  onShowLocation: () => void;
  onComplete: () => void;
}) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [showLocation, setShowLocation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const dialog = useDialogAccessibility(undefined, true, undefined, false);

  useEffect(() => {
    heading.current?.focus();
    if (!showLocation) return;
    const target = document.querySelector<HTMLElement>("[data-status-engine-entry]");
    const screen = target?.closest<HTMLElement>(".screen");
    const window = windowRef.current;
    if (!target || !screen || !window) return;
    const positionTarget = () => {
      const rect = window.getBoundingClientRect();
      const button = target.getBoundingClientRect();
      screen.scrollTop += button.top + button.height / 2 - (rect.top + rect.height / 2);
    };
    positionTarget();
    const observer = new ResizeObserver(positionTarget);
    observer.observe(window);
    target.classList.add("test-guide-highlight");
    return () => {
      observer.disconnect();
      target.classList.remove("test-guide-highlight");
    };
  }, [step, showLocation]);

  const titles = [
    "testGuide.welcome",
    "testGuide.find",
    "testGuide.try",
    "testGuide.feedback",
  ] as const;
  return (
    <div
      ref={dialog}
      className={`test-guide${showLocation ? " test-guide--location" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-guide-title"
      tabIndex={-1}
    >
      <header className="test-guide-header">
        <div className="test-guide-topline">
          <span>{t("testGuide.progress", { step: step + 1 })}</span>
          <LanguageSwitcher />
        </div>
        <div className="test-guide-progress" aria-hidden="true">
          {titles.map((title, index) => (
            <span key={title} className={index <= step ? "is-read" : ""} />
          ))}
        </div>
        <h2 id="test-guide-title" ref={heading} tabIndex={-1}>
          {t(showLocation ? "testGuide.here" : titles[step])}
        </h2>
        {showLocation && <p>{t("testGuide.locationCaption")}</p>}
      </header>
      {showLocation ? (
        <div className="test-guide-location-window" ref={windowRef} aria-hidden="true" />
      ) : (
        <div className="test-guide-body" key={step}>
          {step === 0 && (
            <>
              <div className="test-guide-symbol" aria-hidden="true">
                <Icon name="hook" size={34} />
              </div>
              <p>{t("testGuide.intro")}</p>
              <p className="test-guide-note">{t("testGuide.prototype")}</p>
              <p>{t("testGuide.noExperience")}</p>
            </>
          )}
          {step === 1 && (
            <>
              <p>{t("testGuide.engine")}</p>
              <p className="test-guide-route">
                <Icon name="menu" />
                {t("testGuide.route")}
              </p>
              <p>{t("testGuide.findHelp")}</p>
              <button
                className="test-guide-primary"
                onClick={() => {
                  onShowLocation();
                  setShowLocation(true);
                }}
              >
                {t("testGuide.showLocation")} <Icon name="chevron" size={18} />
              </button>
              <p>{t("testGuide.desktopHint")}</p>
            </>
          )}
          {step === 2 && (
            <>
              <p>{t("testGuide.activate")}</p>
              <ul className="test-guide-examples">
                <li>
                  <b>{t("testGuide.ready")}</b>
                  <p>{t("testGuide.readyHelp")}</p>
                </li>
                <li>
                  <b>{t("testGuide.missing")}</b>
                  <p>{t("testGuide.missingHelp")}</p>
                </li>
                <li>
                  <b>{t("testGuide.limits")}</b>
                  <p>{t("testGuide.limitsHelp")}</p>
                </li>
                <li>
                  <b>{t("testGuide.payment")}</b>
                  <p>{t("testGuide.paymentHelp")}</p>
                </li>
              </ul>
              <p className="test-guide-note">{t("testGuide.actualData")}</p>
              <p>{t("testGuide.reset")}</p>
            </>
          )}
          {step === 3 && (
            <>
              <p>{t("testGuide.feedbackIntro")}</p>
              <ul className="test-guide-examples">
                <li>{t("testGuide.questionTask")}</li>
                <li>{t("testGuide.questionConfused")}</li>
                <li>{t("testGuide.questionDesign")}</li>
              </ul>
              <p>{t("testGuide.sendFeedback")}</p>
              <p className="test-guide-note">{t("testGuide.localFeedback")}</p>
              <p>{t("testGuide.reopenHint")}</p>
            </>
          )}
        </div>
      )}
      <footer className="test-guide-footer">
        {step > 0 && (
          <button
            className="test-guide-back"
            onClick={() => {
              if (showLocation) setShowLocation(false);
              else setStep(step - 1);
            }}
          >
            {t("testGuide.back")}
          </button>
        )}
        {(step !== 1 || showLocation) && (
          <button
            className="test-guide-primary"
            onClick={() => {
              if (step === 3) onComplete();
              else {
                setShowLocation(false);
                setStep(step + 1);
              }
            }}
          >
            {t(step === 3 ? "testGuide.start" : "testGuide.next")}
          </button>
        )}
      </footer>
    </div>
  );
}
