"use client";
import { useState } from "react";
import { useDocuments } from "./use-documents";
import { DocumentForm } from "./document-form";
import { readProfile } from "@/features/profile/local-profile";
import { getAppNow } from "@/domain/shared/app-clock";
import { createLocalId } from "@/lib/create-local-id";
import { validateAccessGrant, isAccessGrantActive } from "@/domain/documents/access-grants";
import type { AccessGrant } from "@/domain/documents/fishing-document";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
export function LandownerAccess() {
  const store = useDocuments();
  const { language } = useLanguage();
  const text = (no: string, en: string) => selectLocalized(language, no, en);
  const [register, setRegister] = useState(false);
  const [parentId, setParentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AccessGrant["role"]>("guest");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const profile = readProfile();
  const owned = store.documents.filter(
    (d) =>
      d.values.category === "Grunneierkort" &&
      !!profile.email &&
      d.ownerEmail?.toLowerCase() === profile.email.trim().toLowerCase(),
  );
  const parent = owned.find((d) => d.id === parentId);
  const received = store.documents.flatMap((d) =>
    (d.accessGrants ?? [])
      .filter((g) => g.recipientEmail.toLowerCase() === profile.email.trim().toLowerCase())
      .map((g) => ({ parent: d, grant: g })),
  );
  return (
    <details className="landowner-access">
      <summary>
        {text("Grunneierkort, gjestekort og oppsyn", "Landowner, guest and warden access")}
      </summary>
      <p>
        {text(
          "Lokal prototype: Tilganger lagres i denne nettleseren. Mottakeren får ingen melding eller tilgang på en annen enhet.",
          "Local prototype: access is stored in this browser. Recipients are not notified and cannot access it on another device.",
        )}
      </p>
      {!profile.email && (
        <p>{text("Fyll inn e-post i profilen først.", "Add your email to your profile first.")}</p>
      )}
      <button
        type="button"
        className="secondary"
        disabled={!profile.email}
        onClick={() => setRegister(!register)}
      >
        {text("Registrer grunneierkort", "Register landowner permit")}
      </button>
      {register && (
        <DocumentForm
          kind="permit"
          verification={{ method: "manual" }}
          cancel={() => setRegister(false)}
          save={async (document) => {
            if (document.values.category !== "Grunneierkort")
              return {
                ok: false,
                error: text("Velg korttypen Grunneierkort.", "Choose Landowner permit."),
              };
            const result = await store.save({
              ...document,
              ownerEmail: profile.email.trim().toLowerCase(),
            });
            if (result.ok) {
              setRegister(false);
              setParentId(document.id);
            }
            return result;
          }}
        />
      )}
      {owned.length > 0 && (
        <form
          className="permit-checkout-step"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!parent || busy) return;
            const grant: AccessGrant = {
              id: createLocalId(),
              recipientName: name.trim(),
              recipientEmail: email.trim().toLowerCase(),
              role,
              startsAt: start,
              endsAt: end,
              createdAt: getAppNow(),
            };
            const validation = validateAccessGrant(parent, grant, profile.email);
            if (validation) {
              setError(validation);
              return;
            }
            setBusy(true);
            const result = await store.save({
              ...parent,
              accessGrants: [...(parent.accessGrants ?? []), grant],
            });
            setBusy(false);
            if (!result.ok) setError(result.error);
            else {
              setError("");
              setName("");
              setEmail("");
            }
          }}
        >
          <label>
            {text("Grunneierkort", "Landowner permit")}
            <select required value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">{text("Velg kort", "Choose permit")}</option>
              {owned.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.values.holder} · {d.values.area}
                </option>
              ))}
            </select>
          </label>
          {parent && (
            <p>
              {parent.values.area} · {parent.values.startsAt?.replace("T", " ")} –{" "}
              {parent.values.endsAt?.replace("T", " ")}
            </p>
          )}
          <label>
            {text("Mottakerens navn", "Recipient name")}
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            {text("Mottakerens e-post / bruker", "Recipient email / user")}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {text("Tilgang", "Access")}
            <select value={role} onChange={(e) => setRole(e.target.value as AccessGrant["role"])}>
              <option value="guest">{text("Gjestekort", "Guest permit")}</option>
              <option value="warden">
                {text("Oppsyn – uten fiskerett", "Warden – no fishing rights")}
              </option>
            </select>
          </label>
          <label>
            {text("Gyldig fra", "Valid from")}
            <input
              type="datetime-local"
              required
              min={parent?.values.startsAt}
              max={parent?.values.endsAt}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            {text("Gyldig til", "Valid until")}
            <input
              type="datetime-local"
              required
              min={start || parent?.values.startsAt}
              max={parent?.values.endsAt}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="primary" disabled={busy || !parent}>
            {text("Tildel tilgang lokalt", "Grant local access")}
          </button>
        </form>
      )}
      {owned.flatMap((d) =>
        (d.accessGrants ?? []).map((g) => (
          <article className="document-card" key={g.id}>
            <h3>{g.recipientName}</h3>
            <p>
              {g.recipientEmail} ·{" "}
              {g.role === "guest"
                ? text("Gjestekort", "Guest permit")
                : text("Oppsyn – uten fiskerett", "Warden – no fishing rights")}
            </p>
            <p>{d.values.area}</p>
            <p>
              {g.startsAt.replace("T", " ")} – {g.endsAt.replace("T", " ")}
            </p>
            <p>
              {g.revokedAt
                ? text("Tilbakekalt", "Revoked")
                : isAccessGrantActive(d, g, getAppNow())
                  ? text("Gyldig nå", "Valid now")
                  : text("Ikke gyldig nå", "Not valid now")}
            </p>
            {!g.revokedAt && (
              <button
                type="button"
                onClick={async () => {
                  const result = await store.save({
                    ...d,
                    accessGrants: d.accessGrants?.map((item) =>
                      item.id === g.id ? { ...item, revokedAt: getAppNow() } : item,
                    ),
                  });
                  if (!result.ok) setError(result.error);
                }}
              >
                {text("Trekk tilbake tilgang", "Revoke access")}
              </button>
            )}
          </article>
        )),
      )}
      {received.map(({ parent: d, grant: g }) => (
        <article className="document-card" key={g.id}>
          <h3>
            {text("Din tilgang", "Your access")}: {g.recipientName}
          </h3>
          <p>
            {g.role === "guest"
              ? text("Gjestekort", "Guest permit")
              : text("Oppsyn – uten fiskerett", "Warden – no fishing rights")}
          </p>
          <p>
            {d.values.area} · {g.startsAt.replace("T", " ")} – {g.endsAt.replace("T", " ")}
          </p>
          <p>
            {isAccessGrantActive(d, g, getAppNow())
              ? text("Gyldig nå", "Valid now")
              : text("Ikke gyldig nå", "Not valid now")}
          </p>
        </article>
      ))}
    </details>
  );
}
