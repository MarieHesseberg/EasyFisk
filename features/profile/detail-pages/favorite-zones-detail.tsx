"use client";

import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

const newFavorite = "Sone 4 · Laudal–Bjelland";

export function FavoriteZonesDetail() {
  const { preferences, addFavorite, removeFavorite } = usePreferencesController();
  const alreadyAdded = preferences.favoriteZones.includes(newFavorite);
  return (
    <div className="specific-detail">
      <p className="detail-lead">
        Favoritter gir rask tilgang til kart, regler, temperatur og tilgjengelige fiskekort.
      </p>
      <div className="favorite-list">
        {preferences.favoriteZones.map((name, index) => (
          <div key={name}>
            <span className="favorite-number">{index + 2}</span>
            <p>
              <b>{name}</b>
              <small>
                {index === 0
                  ? "Åpen · 11 °C · fiskekort registrert"
                  : "Åpen · delsone med eget fiskekort"}
              </small>
            </p>
            <button onClick={() => removeFavorite(name)}>Fjern</button>
          </div>
        ))}
      </div>
      <button className="primary" onClick={() => addFavorite(newFavorite)} disabled={alreadyAdded}>
        {alreadyAdded ? "Sone 4 er lagt til" : "Legg til Sone 4"}
      </button>
    </div>
  );
}
