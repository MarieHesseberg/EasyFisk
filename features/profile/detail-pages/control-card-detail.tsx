"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";

export function ControlCardDetail() {
  const [updated, setUpdated] = useState(false);
  const { profile } = appContentRepository.getContent();
  return (
    <div className="specific-detail">
      <div className="detail-hero valid">
        <Icon name="check" />
        <div>
          <small>KLAR FOR KONTROLL</small>
          <h3>Dokumentasjonen er gyldig</h3>
          <p>Vis denne siden til fiskeoppsynet</p>
        </div>
      </div>
      <div className="control-code">
        {profile.controlCodePrefix}
        <br />
        <b>{profile.fisherId}</b>
        <small>KONTROLLKODE · OPPDATERT NÅ</small>
      </div>
      <div className="detail-data">
        {profile.controlCardRows.map((row) => (
          <p key={row.label}>
            <span>{row.label}</span>
            <b className={row.isPositive ? "status-positive" : undefined}>{row.value}</b>
          </p>
        ))}
      </div>
      <button className="primary" onClick={() => setUpdated(true)}>
        {updated ? "Kontrollkort oppdatert" : "Oppdater kontrollkort"}
      </button>
    </div>
  );
}
