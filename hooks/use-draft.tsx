"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";
import { draftRepository } from "@/data/repositories/drafts";
import { useLanguage } from "@/components/localization/language-provider";

type DraftContextValue = {
  initialize: <T>(key: string, fallback: T) => T;
  write: (key: string, value: unknown) => void;
  complete: () => Promise<boolean>;
  discard: () => void;
  dirty: boolean;
  saving: boolean;
  error: boolean;
  discarded: boolean;
};
const DraftContext = createContext<DraftContextValue | null>(null);
export const useDraft = () => useContext(DraftContext);
export function DraftScope({
  id,
  children,
  onDiscard,
}: {
  id: string;
  children: ReactNode;
  onDiscard?: () => void;
}) {
  const supported = typeof indexedDB !== "undefined";
  const [ready, setReady] = useState(!supported);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const values = useRef<Record<string, unknown>>({});
  const completed = useRef(false);
  const writes = useRef(0);
  const generation = useRef(0);
  const { t } = useLanguage();
  useEffect(() => {
    if (!supported) return;
    let active = true;
    draftRepository.read(id).then(
      (stored) => {
        if (active) {
          values.current = stored;
          setDirty(Object.keys(stored).length > 0);
          setReady(true);
        }
      },
      () => {
        if (active) {
          setError(true);
          setReady(true);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [id, supported]);
  function initialize<T>(key: string, fallback: T): T {
    if (!Object.prototype.hasOwnProperty.call(values.current, key)) values.current[key] = fallback;
    return values.current[key] as T;
  }
  function write(key: string, value: unknown) {
    if (completed.current || generation.current !== revision) return;
    values.current[key] = value;
    setDirty(true);
    if (!supported) {
      setError(true);
      return;
    }
    setSaving(true);
    const version = ++writes.current;
    void draftRepository.save(id, { ...values.current }).then(
      () => {
        if (version === writes.current) {
          setSaving(false);
          setError(false);
        }
      },
      () => {
        if (version === writes.current) {
          setSaving(false);
          setError(true);
        }
      },
    );
  }
  async function complete() {
    completed.current = true;
    ++writes.current;
    setSaving(false);
    setDirty(false);
    if (supported) {
      try {
        await draftRepository.remove(id);
        setError(false);
      } catch {
        setError(true);
        setDirty(true);
        completed.current = false;
        return false;
      }
    }
    return true;
  }
  async function discard() {
    if (!(await complete())) return;
    generation.current += 1;
    onDiscard?.();
    values.current = {};
    completed.current = false;
    setDiscarded(true);
    setRevision((n) => n + 1);
  }
  if (!ready) return <p role="status">{t("draft.loading")}</p>;
  return (
    <DraftContext.Provider
      key={revision}
      value={{ initialize, write, complete, discard, dirty, saving, error, discarded }}
    >
      {children}
    </DraftContext.Provider>
  );
}
export function useDraftState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const draft = useDraft();
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    return draft ? draft.initialize(key, fallback) : fallback;
  });
  const current = useRef(value);
  return [
    value,
    (action) => {
      const next =
        typeof action === "function" ? (action as (old: T) => T)(current.current) : action;
      current.current = next;
      setValue(next);
      draft?.write(key, next);
    },
  ];
}
export function DraftControls({ disabled = false }: { disabled?: boolean }) {
  const draft = useDraft();
  const { t } = useLanguage();
  if (!draft || (!draft.dirty && !draft.error)) return null;
  return (
    <div className="draft-controls">
      <span role={draft.error ? "alert" : "status"}>
        {t(draft.error ? "draft.error" : draft.saving ? "draft.saving" : "draft.saved")}
      </span>
      {draft.dirty && (
        <button type="button" disabled={disabled || draft.saving} onClick={draft.discard}>
          {t("draft.discard")}
        </button>
      )}
    </div>
  );
}
