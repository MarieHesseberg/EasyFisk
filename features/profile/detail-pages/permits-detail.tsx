"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";

export function PermitsDetail() {
  const [saved, setSaved] = useState(false);
  const { activePermit, previousPermits } = appContentRepository.getContent().profile;
  return (
    <div className="specific-detail">
      <div className="detail-hero valid">
        <Icon name="ticket" />
        <div>
          <small>AKTIVT FISKEKORT</small>
          <h3>{activePermit.zone}</h3>
          <p>{activePermit.summary}</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Kortnummer</span>
          <b>{activePermit.number}</b>
        </p>
        <p>
          <span>Kortholder</span>
          <b>{activePermit.holder}</b>
        </p>
        <p>
          <span>Område</span>
          <b>{activePermit.area}</b>
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
        {previousPermits.map((permit) => (
          <p key={`${permit.title}-${permit.description}`}>
            <b>{permit.title}</b>
            <span>{permit.description}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
