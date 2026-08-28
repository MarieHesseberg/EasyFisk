"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { ProfileDetailDialog } from "@/features/profile/profile-detail-dialog";

export function ProfileScreen() {
  const [detail, setDetail] = useState<DetailDestination | null>(null);
  const { profile } = appContentRepository.getContent();
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
      {detail && <ProfileDetailDialog destination={detail} close={() => setDetail(null)} />}
    </div>
  );
}
