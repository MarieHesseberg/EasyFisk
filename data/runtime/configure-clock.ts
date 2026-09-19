import { configureAppClock, systemClock } from "../../domain/shared/app-clock";
import { demoNow } from "../prototype/demo-clock";
import { appMode } from "./environment";
export const runtimeClock = appMode === "demo" ? { now: demoNow } : systemClock;
configureAppClock(runtimeClock);
