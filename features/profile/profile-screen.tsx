"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { ProfileDetailDialog } from "@/features/profile/profile-detail-dialog";
import { StatusEngineSettingsDialog } from "@/features/profile/status-engine-settings-dialog";

type ProfileDestination = DetailDestination | "status-engine";

export function ProfileScreen({
  demoStatus,
  selectDemoStatus,
  testDemoStatus,
}: {
  demoStatus: DemoStatus;
  selectDemoStatus: (status: DemoStatus) => void;
  testDemoStatus: () => void;
}) {
  const [detail, setDetail] = useState<ProfileDestination | null>(null);
  const { profile } = appContentRepository.getContent();
  const scenarios = fishingContentRepository.getDemoScenarios();
  const selectedScenario = findDemoStatus(demoStatus, scenarios);
  return (
    <div className="screen">
      <ScreenHeader title="Mer" />
      <button className="more-profile-card" onClick={() => setDetail("profile-privacy")}>
        <div className="avatar">{profile.initials}</div>
        <div>
          <h2>Fiskerprofil</h2>
          <p>Fisker-ID · {profile.fisherId}</p>
        </div>
        <Icon name="chevron" />
      </button>
      <div className="menu-list">
        {profile.menuItems.map(({ destination, icon, title, description }) => (
          <button key={destination} onClick={() => setDetail(destination)}>
            <span>
              <Icon name={icon} />
            </span>
            <p>
              <b>{title}</b>
              <small>{description}</small>
            </p>
            <Icon name="chevron" size={18} />
          </button>
        ))}
        <button onClick={() => setDetail("fee")}>
          <span>
            <Icon name="book" />
          </span>
          <p>
            <b>Statlig fiskeravgift</b>
            <small>Registrer kvittering eller fritak</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => setDetail("status-engine")}>
          <span>
            <Icon name="stats" />
          </span>
          <p>
            <b>Statusmotor</b>
            <small>Velg situasjon for prototypens statuskontroll</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
      </div>
      <section className="more-feedback-card">
        <small>TILBAKEMELDING OG OBSERVASJON</small>
        <h3>Meld fra til elveeigarlaget</h3>
        <p>Velg kategori, legg ved bilde og valgfri posisjon, og følg status på meldingen.</p>
        <button onClick={() => setDetail("feedback")}>Opprett melding</button>
      </section>
      <p className="version">
        EasyFisk prototype · innhold kontrollert{" "}
        {activeFishingRules.metadata.numericSourcesCheckedLabel}
      </p>
      {detail === "status-engine" && (
        <StatusEngineSettingsDialog
          close={() => setDetail(null)}
          scenarios={scenarios}
          selected={selectedScenario}
          selectStatus={selectDemoStatus}
          startTest={testDemoStatus}
        />
      )}
      {detail && detail !== "status-engine" && (
        <ProfileDetailDialog destination={detail} close={() => setDetail(null)} />
      )}
    </div>
  );
}
