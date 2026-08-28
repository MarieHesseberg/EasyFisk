"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";

export function DisinfectionDetail() {
  const [saved, setSaved] = useState(false);
  const [showStations, setShowStations] = useState(false);
  const { disinfection, disinfectionStations } = appContentRepository.getContent().profile;
  return (
    <div className="specific-detail">
      <div className="detail-hero valid">
        <Icon name="shield" />
        <div>
          <small>STATUS</small>
          <h3>Desinfisering er gyldig</h3>
          <p>Registrert ved {disinfection.station}</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Registrert</span>
          <b>{disinfection.registeredAt}</b>
        </p>
        <p>
          <span>Gyldig til</span>
          <b>{disinfection.validUntil}</b>
        </p>
        <p>
          <span>Andre vassdrag</span>
          <b>{disinfection.otherRivers}</b>
        </p>
      </div>
      <div className="detail-warning">
        <Icon name="bell" />
        <p>
          <b>Har du fisket i et annet vassdrag?</b>
          <span>Da må utstyret desinfiseres på nytt før du fisker i Mandalselva.</span>
        </p>
      </div>
      <button className="primary" onClick={() => setSaved(true)}>
        {saved ? "Nytt vassdrag er registrert" : "Registrer besøk i annet vassdrag"}
      </button>
      <button className="secondary" onClick={() => setShowStations((visible) => !visible)}>
        {showStations ? "Skjul stasjoner" : "Finn desinfiseringsstasjon"}
      </button>
      {showStations && (
        <div className="detail-list">
          {disinfectionStations.map((station) => (
            <p key={station.title}>
              <b>{station.title}</b>
              <span>{station.description}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
