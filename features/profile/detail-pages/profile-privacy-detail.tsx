"use client";

import { useState } from "react";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";
import { appContentRepository } from "@/data/repositories/app-content";
import { FormError } from "@/components/ui/form-error";

export function ProfilePrivacyDetail() {
  const [saved, setSaved] = useState(false);
  const { error, preferences, setPositionSuggestions, setShareAnonymousData } =
    usePreferencesController();
  const { profile } = appContentRepository.getContent();
  return (
    <div className="specific-detail">
      <div className="profile-detail">
        <div className="avatar">{profile.initials}</div>
        <div>
          <h3>Fiskerprofil</h3>
          <p>Fisker-ID {profile.fisherId}</p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>Navn</span>
          <b>{profile.name}</b>
        </p>
        <p>
          <span>Telefon</span>
          <b>{profile.maskedPhone}</b>
        </p>
        <p>
          <span>Språk</span>
          <b>{profile.language}</b>
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
      <FormError message={error} />
      <button className="primary" disabled={Boolean(error)} onClick={() => setSaved(true)}>
        {saved ? "Innstillingene er lagret" : "Lagre innstillinger"}
      </button>
    </div>
  );
}
