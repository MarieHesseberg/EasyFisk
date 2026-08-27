"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { Detail } from "@/features/profile/detail";

export function More() {
  const [detail, setDetail] = useState("");
  const items = [
    ["ticket", "Mine fiskekort", "Aktive, kommende og tidligere kort"],
    ["shield", "Desinfisering", "Gyldighet og registreringssted"],
    ["bell", "Varsler og stengninger", "Regelendringer, temperatur og frister"],
    ["map", "Favorittsoner", "Rask tilgang til soner og delsoner"],
    ["user", "Profil og personvern", "Språk, samtykker og konto"],
  ];
  return (
    <div className="screen">
      <Header title="Mer" />
      <button className="profile-card" onClick={() => setDetail("Profil og personvern")}>
        <div className="avatar">MF</div>
        <div>
          <h2>Fiskerprofil</h2>
          <p>Fisker-ID · 10482</p>
        </div>
        <Icon name="chevron" />
      </button>
      <div className="menu-list">
        {items.map(([icon, title, sub]) => (
          <button key={title} onClick={() => setDetail(title)}>
            <span>
              <Icon name={icon} />
            </span>
            <p>
              <b>{title}</b>
              <small>{sub}</small>
            </p>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>
      <section className="feedback">
        <small>TILBAKEMELDING OG OBSERVASJON</small>
        <h3>Meld fra til elveeigarlaget</h3>
        <p>Velg kategori, legg ved bilde og valgfri posisjon, og følg status på meldingen.</p>
        <button onClick={() => setDetail("Tilbakemelding")}>Opprett melding</button>
      </section>
      <p className="version">EasyFisk prototype · innhold kontrollert 19.08.2026</p>
      {detail && <Detail title={detail} close={() => setDetail("")} />}
    </div>
  );
}
