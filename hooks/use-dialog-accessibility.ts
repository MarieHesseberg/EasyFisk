"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogAccessibility(
  onClose?: () => void,
  active = true,
  returnFocusRef?: RefObject<HTMLElement | null>,
) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const returnFocus = returnFocusRef?.current ?? previousFocus;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = dialog.querySelector<HTMLElement>(focusableSelector);
    (focusable ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const navigation = document.querySelector(".bottom-nav");
      const elements = [
        ...dialog.querySelectorAll<HTMLElement>(focusableSelector),
        ...(navigation?.querySelectorAll<HTMLElement>(focusableSelector) ?? []),
      ].filter((element) => element.getClientRects().length > 0);
      if (!elements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const navigation = document.querySelector(".bottom-nav");
    dialog.addEventListener("keydown", handleKeyDown);
    navigation?.addEventListener("keydown", handleKeyDown as EventListener);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      navigation?.removeEventListener("keydown", handleKeyDown as EventListener);
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [active, returnFocusRef]);

  return dialogRef;
}
