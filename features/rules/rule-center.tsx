"use client";
import { getAppDate } from "@/domain/shared/app-clock";
import { selectLocalized } from "@/locales";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeText } from "@/domain/localization/localized-text";
const ruleSections = fishingContentRepository.getRuleSections();
export function RuleCenter({ now }: { now?: number }) {
  const [open, setOpen] = useState("");
  const { language, t } = useLanguage();
  const { currentNotice, metadata, season, sources } = activeFishingRules;
  return (
    <div className="rule-center">
      {getAppDate(now) >= currentNotice.publishedDate && (
        <div className="season-alert">
          <Icon name="bell" size={18} />
          <div>
            <b>
              {selectLocalized(
                language,
                currentNotice.title,
                "Fishing permit sales have ended for 2026",
              )}
            </b>
            <p>
              {selectLocalized(
                language,
                currentNotice.detail,
                "No new fishing permits are sold after 26 August at 09:00. Permits already purchased remain valid for their stated period.",
              )}
            </p>
          </div>
        </div>
      )}
      {ruleSections.map((section) => (
        <article className={open === section.id ? "open" : ""} key={section.id}>
          <button
            aria-expanded={open === section.id}
            onClick={() => setOpen(open === section.id ? "" : section.id)}
          >
            <span>
              <Icon name={section.icon} />
            </span>
            <div>
              <b>{t(section.title)}</b>
              <small>{t(localizeText(section.summary, language))}</small>
            </div>
            <i>{open === section.id ? "−" : "+"}</i>
          </button>
          {open === section.id && (
            <div className="rule-body">
              {section.rules.map((rule) => (
                <p key={localizeText(rule, "no")}>
                  <Icon name="check" size={14} />
                  <span>{t(localizeText(rule, language))}</span>
                </p>
              ))}
            </div>
          )}
        </article>
      ))}
      <details className="rules-disclosure rule-updates">
        <summary>
          {selectLocalized(language, "Kilder og oppdateringer", "Sources and updates")}
        </summary>
        <div className="rule-version">
          <span>
            <Icon name="check" size={18} />
          </span>
          <div>
            <small>{selectLocalized(language, "AKTIV REGELVERSJON", "ACTIVE RULE VERSION")}</small>
            <b>
              {metadata.river} {metadata.seasonYear} ·{" "}
              {selectLocalized(language, "oppdatert", "updated")}{" "}
              {selectLocalized(language, metadata.shortVersionLabel, t(metadata.shortVersionLabel))}
            </b>
            <p>
              {selectLocalized(language, "Kilder kontrollert", "Sources checked")}{" "}
              {t(metadata.sourcesCheckedLabel)}
            </p>
          </div>
        </div>
        <div className="season-alert">
          <Icon name="bell" size={18} />
          <div>
            <b>
              {selectLocalized(
                language,
                "Midtsesongevalueringen er innarbeidet",
                "Mid-season evaluation included",
              )}
            </b>
            <p>
              {selectLocalized(
                language,
                `Sone ${season.extendedZoneId} er forlenget til ${season.extendedEndLabel}, med unntak for Bjåhylen og Nodehylen som stenger ${season.standardEndLabel}.`,
                `Zone ${season.extendedZoneId} has been extended to ${t(season.extendedEndLabel)}, except Bjåhylen and Nodehylen, which close on ${t(season.standardEndLabel)}.`,
              )}
            </p>
          </div>
        </div>
        <div className="rule-sources">
          <b>{selectLocalized(language, "Offisielle kilder", "Official sources")}</b>
          <a href={sources.localRules} target="_blank" rel="noreferrer">
            Mandalselva Elveeigarlag ·{" "}
            {selectLocalized(language, "fullstendige regler", "complete rules")}
          </a>
          <a href={sources.currentNotices} target="_blank" rel="noreferrer">
            Mandalselva Elveeigarlag ·{" "}
            {selectLocalized(language, "dagsaktuelle meldinger", "current notices")}
          </a>
          <a href={sources.publicRegulation} target="_blank" rel="noreferrer">
            Lovdata · {selectLocalized(language, "offentlig forskrift", "public regulation")}
          </a>
          <a
            href="https://www.statsforvalteren.no/agder/miljo-og-klima/fiskeforvaltning/tema/lakse--og-sjoaurefiske-i-vassdrag/"
            target="_blank"
            rel="noreferrer"
          >
            Statsforvalteren i Agder ·{" "}
            {selectLocalized(language, "offentlige regler", "public rules")}
          </a>
        </div>
      </details>
    </div>
  );
}
