"use client";

import { useState } from "react";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

export function ProfilePrivacyDetail() {
  const [saved, setSaved] = useState(false);
  const { preferences, setPositionSuggestions, setShareAnonymousData } = usePreferencesController();
  return (
    <div className="specific-detail">
      <div className="profile-detail">
        <div className="avatar">MF</div>
        <div>
          <h3>Fiskerprofil</h3>
          <p>Fisker-ID 10482</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Navn</span>
          <b>Prototypebruker</b>
        </p>
        <p>
          <span>Telefon</span>
          <b>•• •• •• 82</b>
        </p>
        <p>
          <span>Språk</span>
          <b>Norsk bokmål</b>
        </p>
      </div>
      <h3 className="detail-subtitle">Personvern og samtykker</h3>
      <div className="toggle-list">
        <label>
          <span>
            <b>Posisjon ved soneforslag</b>
            <small>Brukes bare når du ber om å finne riktig sone</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.positionSuggestions}
            onChange={(event) => setPositionSuggestions(event.target.checked)}
          />
        </label>
        <label>
          <span>
            <b>Del anonymisert innsatsdata</b>
            <small>Bidrar til statistikk uten å vise identiteten din</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.shareAnonymousData}
            onChange={(event) => setShareAnonymousData(event.target.checked)}
          />
        </label>
      </div>
      <button className="primary" onClick={() => setSaved(true)}>
        {saved ? "Innstillingene er lagret" : "Lagre innstillinger"}
      </button>
    </div>
  );
}
