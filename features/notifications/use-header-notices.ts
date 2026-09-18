"use client";
import { useSyncExternalStore } from "react";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { currentRuleVersion } from "@/domain/fishing-rules/rule-acceptance";
import { useCurrentTime } from "@/hooks/use-current-time";
import { getAppDate } from "@/domain/shared/app-clock";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
export const readNoticesKey = "easyfisk-read-notices-v1";
const changed = "easyfisk-notices-read";
function snapshot() {
  try {
    return localStorage.getItem(readNoticesKey) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribe(update: () => void) {
  window.addEventListener(changed, update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener(changed, update);
    window.removeEventListener("storage", update);
  };
}
export function parseReadNotices(value: string): string[] {
  try {
    const data: unknown = JSON.parse(value);
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
export function useHeaderNotices() {
  const { language, t } = useLanguage();
  const now = useCurrentTime();
  const read = parseReadNotices(useSyncExternalStore(subscribe, snapshot, () => "[]"));
  const { currentNotice, metadata } = activeFishingRules;
  const notices = [
    {
      id: `rules:${currentRuleVersion}`,
      title: selectLocalized(language, "Oppdaterte fiskeregler", "Updated fishing rules"),
      detail: selectLocalized(
        language,
        `Regelversjon ${metadata.versionLabel}. Les reglene før du starter. Appen ber om ny bekreftelse når reglene endres.`,
        `Rule version ${metadata.versionDate}. Read the rules before starting. The app asks for new acceptance when the rules change.`,
      ),
    },
  ];
  if (getAppDate(now) >= currentNotice.publishedDate)
    notices.unshift({
      id: `sales:${currentNotice.publishedDate}:${currentNotice.detail}`,
      title: t(currentNotice.title),
      detail: t(currentNotice.detail),
    });
  return {
    notices,
    unread: notices.some((notice) => !read.includes(notice.id)),
    markRead() {
      try {
        localStorage.setItem(
          readNoticesKey,
          JSON.stringify([
            ...new Set([...parseReadNotices(snapshot()), ...notices.map((n) => n.id)]),
          ]),
        );
        window.dispatchEvent(new Event(changed));
        return true;
      } catch {
        return false;
      }
    },
  };
}
