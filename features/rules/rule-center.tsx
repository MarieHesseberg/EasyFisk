"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";

const ruleSections = fishingContentRepository.getRuleSections();

export function RuleCenter() {
  const [open, setOpen] = useState("seasonquota");
  return (
    <div className="rule-center">
      <div className="rule-version">
        <span>
          <Icon name="check" size={18} />
        </span>
        <div>
          <small>AKTIV REGELVERSJON</small>
          <b>Mandalselva 2026 · oppdatert 1. august</b>
          <p>Kilder kontrollert 19. august 2026</p>
        </div>
      </div>
      <div className="season-alert">
        <Icon name="bell" size={18} />
        <div>
          <b>Midtsesongevalueringen er innarbeidet</b>
          <p>
            Sone 4 er forlenget til 15. september, med unntak for Bjåhylen og Nodehylen som stenger
            31. august.
          </p>
        </div>
      </div>
      {ruleSections.map((section) => (
        <article className={open === section.id ? "open" : ""} key={section.id}>
          <button onClick={() => setOpen(open === section.id ? "" : section.id)}>
            <span>
              <Icon name={section.icon} />
            </span>
            <div>
              <b>{section.title}</b>
              <small>{section.summary}</small>
            </div>
            <i>{open === section.id ? "−" : "+"}</i>
          </button>
          {open === section.id && (
            <div className="rule-body">
              {section.rules.map((rule) => (
                <p key={rule}>
                  <Icon name="check" size={14} />
                  <span>{rule}</span>
                </p>
              ))}
            </div>
          )}
        </article>
      ))}
      <div className="rule-sources">
        <b>Offisielle kilder</b>
        <a href="https://lakseelver.no/nb/elver/mandalselva/about" target="_blank" rel="noreferrer">
          Mandalselva Elveeigarlag · fullstendige regler
        </a>
        <a
          href="https://www.statsforvalteren.no/agder/miljo-og-klima/fiskeforvaltning/tema/lakse--og-sjoaurefiske-i-vassdrag/"
          target="_blank"
          rel="noreferrer"
        >
          Statsforvalteren i Agder · offentlige regler
        </a>
      </div>
    </div>
  );
}
