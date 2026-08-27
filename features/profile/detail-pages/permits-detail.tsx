"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function PermitsDetail() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="specific-detail">
      <div className="detail-hero valid">
        <Icon name="ticket" />
        <div>
          <small>AKTIVT FISKEKORT</small>
          <h3>Sone 3 · Øyslebø–Laudal</h3>
          <p>Døgnkort · gyldig i dag til kl. 17:59</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Kortnummer</span>
          <b>ME-2026-10482-031</b>
        </p>
        <p>
          <span>Kortholder</span>
          <b>Fisker-ID 10482</b>
        </p>
        <p>
          <span>Område</span>
          <b>Hele hovedsone 3</b>
        </p>
        <p>
          <span>Status</span>
          <b className="status-positive">Gyldig</b>
        </p>
      </div>
      <button className="primary" onClick={() => setSaved(true)}>
        {saved ? "Nytt kort er lagt til" : "Registrer nytt fiskekort"}
      </button>
      <h3 className="detail-subtitle">Tidligere kort</h3>
      <div className="detail-list">
        <p>
          <b>Sone 2 · Fuskeland B</b>
          <span>16. juni · utløpt</span>
        </p>
        <p>
          <b>Sone 3 · Øyslebø–Laudal</b>
          <span>12. juni · utløpt</span>
        </p>
      </div>
    </div>
  );
}
