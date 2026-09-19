"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDefaultAppServices, type AppServices } from "./services";
const ServicesContext = createContext<AppServices | null>(null);

export function AppServicesProvider({
  services,
  children,
}: {
  services: AppServices;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useAppServices() {
  return useContext(ServicesContext) ?? getDefaultAppServices();
}
