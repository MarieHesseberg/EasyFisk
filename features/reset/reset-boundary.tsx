"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  resetLocalData,
  resetScopes,
  type ResetScope,
} from "@/data/local-storage/reset-local-data";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
export function ResetBoundary({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [scope, setScope] = useState<ResetScope | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const reset = (event: Event) => {
      const value = (event as CustomEvent).detail;
      if (resetScopes.includes(value)) setScope(value);
    };
    window.addEventListener("easyfisk-reset", reset);
    return () => window.removeEventListener("easyfisk-reset", reset);
  }, []);
  useEffect(() => {
    if (!scope) return;
    let active = true;
    resetLocalData(scope).then(
      () => {
        if (active) window.location.reload();
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [scope, attempt]);
  if (!scope) return children;
  return (
    <main className="reset-progress">
      <h1>{selectLocalized(language, "Tilbakestill appen", "Reset the app")}</h1>
      {error ? (
        <>
          <p role="alert">
            {selectLocalized(
              language,
              "Tilbakestillingen ble ikke fullført. Noe kan allerede være slettet. Prøv igjen for å fullføre.",
              "Reset did not finish. Some data may already have been deleted. Try again to finish.",
            )}
          </p>
          <button
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            {selectLocalized(language, "Prøv igjen", "Try again")}
          </button>
        </>
      ) : (
        <p role="status">
          {selectLocalized(language, "Sletter lokale data …", "Deleting local data …")}
        </p>
      )}
    </main>
  );
}
