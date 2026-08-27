"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { NotificationPreference } from "@/domain/preferences/preferences";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

export function MoreDetailContent({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  const [showStations, setShowStations] = useState(false);
  const {
    preferences,
    addFavorite,
    removeFavorite,
    setNotification,
    setPositionSuggestions,
    setShareAnonymousData,
  } = usePreferencesController();
  const notifications: Array<[NotificationPreference, string, string]> = [
    ["emergencyClosure", "Akutt stengning", "Varsle dersom hele elva eller min sone stenges"],
    [
      "highTemperature",
      "Høy vanntemperatur",
      `Varsle når temperaturen nærmer seg ${activeFishingRules.temperature.closureThresholdCelsius} °C`,
    ],
    ["ruleChanges", "Regelendringer", "Varsle når kvoter eller fisketider endres"],
    [
      "reportingDeadline",
      "Rapporteringsfrist",
      "Påminnelse hvis en fangst ikke er ferdig rapportert",
    ],
  ];
  if (title === "Kontrollkort")
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
        <button className="primary" onClick={() => setSaved(true)}>
          {saved ? "Kontrollkort oppdatert" : "Oppdater kontrollkort"}
        </button>
      </div>
    );
  if (title === "Mine fiskekort")
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
  if (title === "Desinfisering")
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
        <button className="secondary" onClick={() => setShowStations(!showStations)}>
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
  if (title === "Varsler og stengninger")
    return (
      <div className="specific-detail">
        <div className="detail-alert">
          <Icon name="check" />
          <div>
            <small>STATUS NÅ</small>
            <h3>Elva er åpen</h3>
            <p>11 °C ved Kjølemo · ingen aktive stengninger</p>
          </div>
        </div>
        <h3 className="detail-subtitle">Mine varsler</h3>
        <div className="toggle-list">
          {notifications.map(([id, label, description]) => (
            <label key={id}>
              <span>
                <b>{label}</b>
                <small>{description}</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.notifications[id]}
                onChange={(event) => setNotification(id, event.target.checked)}
              />
            </label>
          ))}
        </div>
        <button className="primary" onClick={() => setSaved(true)}>
          {saved ? "Varselinnstillinger lagret" : "Lagre varselinnstillinger"}
        </button>
      </div>
    );
  if (title === "Favorittsoner")
    return (
      <div className="specific-detail">
        <p className="detail-lead">
          Favoritter gir rask tilgang til kart, regler, temperatur og tilgjengelige fiskekort.
        </p>
        <div className="favorite-list">
          {preferences.favoriteZones.map((name, i) => (
            <div key={name}>
              <span className="favorite-number">{i + 2}</span>
              <p>
                <b>{name}</b>
                <small>
                  {i === 0
                    ? "Åpen · 11 °C · fiskekort registrert"
                    : "Åpen · delsone med eget fiskekort"}
                </small>
              </p>
              <button onClick={() => removeFavorite(name)}>Fjern</button>
            </div>
          ))}
        </div>
        <button
          className="primary"
          onClick={() => addFavorite("Sone 4 · Laudal–Bjelland")}
          disabled={preferences.favoriteZones.includes("Sone 4 · Laudal–Bjelland")}
        >
          {preferences.favoriteZones.includes("Sone 4 · Laudal–Bjelland")
            ? "Sone 4 er lagt til"
            : "Legg til Sone 4"}
        </button>
      </div>
    );
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
