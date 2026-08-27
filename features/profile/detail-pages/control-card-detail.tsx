"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function ControlCardDetail() {
  const [updated, setUpdated] = useState(false);
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
        EF
        <br />
        <b>10482</b>
        <small>KONTROLLKODE · OPPDATERT NÅ</small>
      </div>
      <div className="detail-data">
        <p>
          <span>Fisker</span>
          <b>Fisker-ID 10482</b>
        </p>
        <p>
          <span>Fiskekort</span>
          <b>Sone 3 · gyldig til 17:59</b>
        </p>
        <p>
          <span>Fiskeravgift</span>
          <b className="status-positive">Dokumentert</b>
        </p>
        <p>
          <span>Desinfisering</span>
          <b className="status-positive">Gyldig</b>
        </p>
        <p>
          <span>Kvote</span>
          <b>Fiske tillatt</b>
        </p>
      </div>
      <button className="primary" onClick={() => setUpdated(true)}>
        {updated ? "Kontrollkort oppdatert" : "Oppdater kontrollkort"}
      </button>
    </div>
  );
}
