"use client";
import { useState } from "react";
import { readProfile, saveProfile } from "./local-profile";
import { DraftScope, DraftControls, useDraft, useDraftState } from "@/hooks/use-draft";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
function ProfileFormContent({ onSaved }: { onSaved: () => void }) {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useDraftState("profile", readProfile);
  const draft = useDraft();
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const fields = [
    ["fullName", "Fullt navn", "Full name", "text", "name"],
    ["birthDate", "Fødselsdato", "Date of birth", "date", "bday"],
    ["email", "E-post", "Email", "email", "email"],
    ["phone", "Telefon", "Phone", "tel", "tel"],
  ] as const;
  return (
    <form
      className="local-profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          saveProfile(profile);
          await draft?.complete();
          setStatus(selectLocalized(language, "Profilen er lagret", "Profile saved"));
          setError(false);
          onSaved();
        } catch {
          setError(true);
          setStatus(t("error.storage.write"));
        }
      }}
    >
      <p>
        {selectLocalized(
          language,
          "Brukes til å fylle ut kjøp og dokumenter for deg.",
          "Used to prefill purchases and documents for you.",
        )}
      </p>
      <DraftControls />
      {fields.map(([key, no, en, type, autoComplete]) => (
        <label key={key}>
          {selectLocalized(language, no, en)}
          <input
            type={type}
            autoComplete={autoComplete}
            value={profile[key]}
            onChange={(e) => {
              setProfile({ ...profile, [key]: e.target.value });
              setStatus("");
            }}
          />
        </label>
      ))}
      <button className="primary" type="submit">
        {selectLocalized(language, "Lagre profil", "Save profile")}
      </button>
      {status && <p role={error ? "alert" : "status"}>{status}</p>}
    </form>
  );
}
export function ProfileForm() {
  const [revision, setRevision] = useState(0);
  const { language } = useLanguage();
  return (
    <>
      <DraftScope key={revision} id="profile">
        <ProfileFormContent onSaved={() => setRevision((n) => n + 1)} />
      </DraftScope>
      {revision > 0 && (
        <p role="status">{selectLocalized(language, "Profilen er lagret", "Profile saved")}</p>
      )}
    </>
  );
}
