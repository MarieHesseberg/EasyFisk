"use client";

import { useState } from "react";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination, Screen } from "@/domain/navigation/navigation";
import type { FlowMode } from "@/domain/sessions/session";
import type { ZoneId } from "@/domain/zones/zone";

export function useAppNavigationController() {
  const [screen, setScreen] = useState<Screen>("home");
  const [flow, setFlow] = useState<FlowMode | null>(null);
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("allMissing");
  const [isStatusTestMode, setIsStatusTestMode] = useState(false);
  const [globalDetail, setGlobalDetail] = useState<DetailDestination | null>(null);
  const [zone, setZone] = useState<ZoneId>(3);
  const [statsMineRequested, setStatsMineRequested] = useState(false);
  const [pastSessionRequested, setPastSessionRequested] = useState(false);

  function navigate(nextScreen: Screen) {
    setPastSessionRequested(false);
    if (nextScreen === "stats") setStatsMineRequested(false);
    setScreen(nextScreen);
  }

  return {
    state: {
      demoStatus,
      flow,
      globalDetail,
      isStatusTestMode,
      pastSessionRequested,
      screen,
      statsMineRequested,
      zone,
    },
    actions: {
      closeDetail: () => setGlobalDetail(null),
      closeFlow: () => setFlow(null),
      navigate,
      openPastSession: () => {
        setPastSessionRequested(true);
        setStatsMineRequested(true);
        setScreen("stats");
      },
      openDetail: setGlobalDetail,
      setDemoStatus,
      setIsStatusTestMode,
      setFlow,
      setScreen,
      setZone,
    },
  };
}
