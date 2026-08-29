"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export function AppDialogPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;

  const appShell = document.querySelector(".phone-app");
  return createPortal(children, appShell ?? document.body);
}
