"use client";

import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";
import { appContentRepository } from "@/data/repositories/app-content";

export function FavoriteZonesDetail() {
  const { preferences, addFavorite, removeFavorite } = usePreferencesController();
  const { favoriteSuggestion, favoriteZoneDescriptions } =
    appContentRepository.getContent().profile;
  const newFavorite = favoriteSuggestion;
  const favoriteZoneShortName = newFavorite.split(" · ")[0];
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
              <small>{favoriteZoneDescriptions[index] ?? favoriteZoneDescriptions.at(-1)}</small>
            </p>
            <button onClick={() => removeFavorite(name)}>Fjern</button>
          </div>
        ))}
      </div>
      <button className="primary" onClick={() => addFavorite(newFavorite)} disabled={alreadyAdded}>
        {alreadyAdded
          ? `${favoriteZoneShortName} er lagt til`
          : `Legg til ${favoriteZoneShortName}`}
      </button>
    </div>
  );
}
