"use client";
import { useState } from "react";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import { resetScopes, type ResetScope } from "@/data/local-storage/reset-local-data";
const labels = {
  all: ["Alt – start med en tom app", "Everything – start with an empty app"],
  fishing: ["Fisketurer, fangster og fangstbilder", "Trips, catches and catch photos"],
  documents: [
    "Dokumenter, kortkjøp og tildelte tilganger",
    "Documents, permit purchases and granted access",
  ],
  feedback: ["Innmeldinger og vedlegg", "Reports and attachments"],
  profile: ["Profilopplysninger", "Profile details"],
  settings: [
    "Innstillinger, leste varsler og regelbekreftelser",
    "Settings, read notifications and rule acceptance",
  ],
  drafts: ["Alle kladder", "All drafts"],
} as const;
export function ResetDataPanel() {
  const { language } = useLanguage();
  const text = (no: string, en: string) => selectLocalized(language, no, en);
  const [scope, setScope] = useState<ResetScope>("all");
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="reset-data-panel">
      <p>
        {text(
          "Velg hva du vil slette fra denne nettleseren. Full tilbakestilling fjerner også profil, aktive turer, bilder, kladder, innstillinger og testmodus. Appens kart og regelinformasjon beholdes.",
          "Choose what to delete from this browser. A full reset also removes your profile, active trips, photos, drafts, settings and test mode. Maps and rule information remain.",
        )}
      </p>
      <label htmlFor="reset-scope">
        {text("Hva vil du tilbakestille?", "What would you like to reset?")}
      </label>
      <select
        id="reset-scope"
        value={scope}
        disabled={confirm}
        onChange={(e) => setScope(e.target.value as ResetScope)}
      >
        {resetScopes.map((value) => (
          <option key={value} value={value}>
            {text(labels[value][0], labels[value][1])}
          </option>
        ))}
      </select>
      <p>
        {text(
          "Kladder slettes også, slik at gamle opplysninger ikke dukker opp igjen. Slettingen kan ikke angres. Dette gjelder bare lokale data, ikke eventuelle kjøp eller rapporter hos andre tjenester.",
          "Drafts are also deleted so old information does not reappear. Deletion cannot be undone. This affects local data only, not purchases or reports held by other services.",
        )}
      </p>
      {confirm ? (
        <div role="group" aria-label={text("Bekreft sletting", "Confirm deletion")}>
          <p>
            {text("Du sletter:", "You are deleting:")}{" "}
            <strong>{text(labels[scope][0], labels[scope][1])}</strong>
          </p>
          <button
            className="primary"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("easyfisk-reset", { detail: scope }))
            }
          >
            {text("Ja, slett og tilbakestill", "Yes, delete and reset")}
          </button>
          <button className="secondary" onClick={() => setConfirm(false)}>
            {text("Avbryt", "Cancel")}
          </button>
        </div>
      ) : (
        <button className="secondary" onClick={() => setConfirm(true)}>
          {text("Slett og tilbakestill", "Delete and reset")}
        </button>
      )}
    </section>
  );
}
