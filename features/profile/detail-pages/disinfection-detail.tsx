"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function DisinfectionDetail() {
  const [saved, setSaved] = useState(false);
  const [showStations, setShowStations] = useState(false);
  return (
    <div className="specific-detail">
      <div className="detail-hero valid">
        <Icon name="shield" />
        <div>
          <small>STATUS</small>
          <h3>Desinfisering er gyldig</h3>
          <p>Registrert ved Marnar Laksesenter</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Registrert</span>
          <b>30. juli 2026 · 14:22</b>
        </p>
        <p>
          <span>Gyldig til</span>
          <b>19. august 2026 · 14:22</b>
        </p>
        <p>
          <span>Andre vassdrag</span>
          <b>Ingen registrert etterpå</b>
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
          <p>
            <b>Marnar Laksesenter</b>
            <span>Øyslebø · 2,4 km</span>
          </p>
          <p>
            <b>Laudal kortutsalg</b>
            <span>Laudal · 13 km</span>
          </p>
          <p>
            <b>Mandal servicesenter</b>
            <span>Mandal · 21 km</span>
          </p>
        </div>
      )}
    </div>
  );
}
