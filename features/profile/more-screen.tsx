"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { Detail } from "@/features/profile/detail";

type MenuItem = {
  destination: Exclude<DetailDestination, "feedback" | "control-card">;
  icon: string;
  title: string;
  description: string;
};

const items: MenuItem[] = [
  {
    destination: "permits",
    icon: "ticket",
    title: "Mine fiskekort",
    description: "Aktive, kommende og tidligere kort",
  },
  {
    destination: "disinfection",
    icon: "shield",
    title: "Desinfisering",
    description: "Gyldighet og registreringssted",
  },
  {
    destination: "notifications",
    icon: "bell",
    title: "Varsler og stengninger",
    description: "Regelendringer, temperatur og frister",
  },
  {
    destination: "favorite-zones",
    icon: "map",
    title: "Favorittsoner",
    description: "Rask tilgang til soner og delsoner",
  },
  {
    destination: "profile-privacy",
    icon: "user",
    title: "Profil og personvern",
    description: "Språk, samtykker og konto",
  },
];

export function More() {
  const [detail, setDetail] = useState<DetailDestination | null>(null);
  return (
    <div className="screen">
      <Header title="Mer" />
      <button className="more-profile-card" onClick={() => setDetail("profile-privacy")}>
        <div className="avatar">MF</div>
        <div>
          <h2>Fiskerprofil</h2>
          <p>Fisker-ID · 10482</p>
        </div>
        <Icon name="chevron" />
      </button>
      <div className="menu-list">
        {items.map(({ destination, icon, title, description }) => (
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
      {detail && <Detail destination={detail} close={() => setDetail(null)} />}
    </div>
  );
}
