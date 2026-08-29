import { afterEach, expect, test } from "vitest";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNavigation } from "../components/layout/bottom-navigation";
import { CheckRow } from "../components/ui/check-row";
import { FeedbackForm } from "../features/feedback/feedback-form";
import { MapScreen } from "../features/map/map-screen";
import { ProfileDetailDialog } from "../features/profile/profile-detail-dialog";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository";
import { StopSessionStep } from "../features/fishing-session/fishing-flow/stop-session-step";
import { operationFailed } from "../domain/shared/operation-result";
import { CatchHistoryList } from "../features/fishing-session/components/catch-history-list";
import { SessionHistoryList } from "../features/fishing-session/components/session-history-list";
import { usePreferencesController } from "../features/profile/hooks/use-preferences-controller";
import { PersonalStatisticsPanel } from "../features/statistics/personal-statistics-panel";
import { calculatePersonalStatistics } from "../domain/statistics/calculate-personal-statistics";

afterEach(cleanup);

test("personlig statistikk viser lokalt beregnet historikk og kvoter", () => {
  const now = Date.parse("2026-07-10T12:00:00+02:00");
  const catches = [
    {
      id: "EF-FANGST-1",
      caughtAt: now,
      submittedAt: now,
      sessionStart: now - 3_600_000,
      species: "Laks" as const,
      result: "Avlivet" as const,
      length: 60,
      weight: 3,
      zone: "Sone 1",
      violation: false,
      late: false,
    },
  ];
  const sessions = [
    {
      id: "EF-OKT-1",
      start: now - 3_600_000,
      end: now,
      duration: 3_600,
      zone: "Sone 1",
      result: "1 laks · avlivet",
    },
  ];

  render(
    <PersonalStatisticsPanel statistics={calculatePersonalStatistics(catches, sessions, now)} />,
  );

  expect(screen.getByRole("heading", { name: "Din statistikk" })).toBeTruthy();
  expect(screen.getByText("1 t 0 min")).toBeTruthy();
  expect(screen.getByText("Laks: 1")).toBeTruthy();
  expect(screen.getByText("1 av 5 brukt · 4 igjen")).toBeTruthy();
});

test("økthistorikken viser tomtilstand uten lagrede økter", () => {
  render(
    <SessionHistoryList catches={[]} sessions={[]} showAll={false} toggleAll={() => undefined} />,
  );

  expect(screen.getByText("Ingen tidligere fiskeøkter")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Se alle" })).toBeNull();
});

test("en lagret økt kan åpnes med tilhørende fangster", async () => {
  const start = new Date(2026, 6, 10, 17, 0).getTime();
  const end = new Date(2026, 6, 10, 19, 0).getTime();
  render(
    <SessionHistoryList
      catches={[
        {
          id: "ME-1",
          caughtAt: start + 30_000,
          submittedAt: end,
          sessionStart: start,
          species: "Laks",
          result: "Gjenutsatt",
          length: 70,
          weight: 4,
          zone: "Sone 3",
          violation: false,
          late: false,
        },
      ]}
      sessions={[
        {
          id: `EF-OKT-${start}-${end}`,
          start,
          end,
          duration: 7_200,
          zone: "Sone 3",
          result: "1 laks · gjenutsatt",
        },
      ]}
      showAll={false}
      toggleAll={() => undefined}
    />,
  );

  await userEvent.setup().click(screen.getByRole("button", { name: /Sone 3/ }));

  expect(screen.getByRole("dialog", { name: "Detaljer for fiskeøkt" })).toBeTruthy();
  expect(screen.getByText("Gjenutsatt · 70 cm · 4 kg")).toBeTruthy();
});

test("avslutningsdialogen viser sonen fra den aktive økten", () => {
  render(
    <StopSessionStep
      cancel={() => undefined}
      elapsed={3600}
      finish={() => undefined}
      startTime={Date.now() - 3600_000}
      zoneName="Sone 4 · Laudal–Kavfossen"
    />,
  );
  expect(screen.getByText("Sone 4 · Laudal–Kavfossen")).toBeTruthy();
});

test("utilgjengelige historiske kontroller vises uten falsk godkjenning", () => {
  render(
    <CheckRow
      title="Fiskekort på valgt dato"
      sub="Fiskekortarkivet er ikke koblet til. Kontroller manuelt."
      state="unavailable"
    />,
  );

  const row = screen.getByText("Fiskekort på valgt dato").closest(".check-row");
  expect(row?.classList.contains("unavailable")).toBe(true);
  expect(row?.classList.contains("ok")).toBe(false);
  expect(screen.getByText("Fiskekortarkivet er ikke koblet til. Kontroller manuelt.")).toBeTruthy();
});

test("hovednavigasjonen markerer valgt side og sender navigasjonshandling", async () => {
  let destination = "";
  render(
    <BottomNavigation
      activeScreen="home"
      hasActiveSession
      navigate={(screen) => {
        destination = screen;
      }}
    />,
  );
  expect(screen.getByRole("button", { name: /Hjem/ }).getAttribute("aria-current")).toBe("page");
  await userEvent.setup().click(screen.getByRole("button", { name: /Kart/ }));
  expect(destination).toBe("map");
});

test("tilbakemeldingsflyten validerer, kontrollerer og sender", async () => {
  const user = userEvent.setup();
  render(<FeedbackForm />);
  await user.click(screen.getByRole("button", { name: "Annet" }));
  await user.type(screen.getByRole("textbox"), "Dette er en gyldig observasjon.");
  await user.click(screen.getByRole("button", { name: "Kontroller meldingen" }));
  expect(screen.getByRole("heading", { name: "Er opplysningene riktige?" })).toBeTruthy();
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Send melding" }));
  expect(await screen.findByText("MELDINGEN ER SENDT")).toBeTruthy();
});

test("kartet viser en forståelig melding når posisjonstilgang avslås", async () => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) =>
        failure({
          code: 1,
          message: "denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError),
    },
  });
  render(<MapScreen selected={3} setSelected={() => undefined} onUseZone={() => undefined} />);
  await userEvent.setup().click(screen.getByRole("button", { name: "Finn min posisjon" }));
  expect((await screen.findByRole("status")).textContent).toContain("Posisjonstilgang ble avslått");
});

test("tom fangsthistorikk forklarer at ingen fangster er registrert", () => {
  render(<CatchHistoryList catches={[]} selectCatch={() => undefined} />);

  expect(screen.getByText("Ingen fangster registrert")).toBeTruthy();
});

test("feil ved lagring av innstillinger blir tilgjengelig for brukergrensesnittet", () => {
  const repository = {
    getPreferences: () => ({
      favoriteZones: [],
      notifications: {
        emergencyClosure: true,
        highTemperature: true,
        riverClosure: true,
        ruleChanges: true,
        reportingDeadline: true,
      },
      positionSuggestions: true,
      shareAnonymousData: false,
    }),
    savePreferences: () => operationFailed("Kunne ikke lagre innstillingene på enheten."),
  };
  const { result } = renderHook(() => usePreferencesController(repository));

  act(() => result.current.setPositionSuggestions(false));

  expect(result.current.error).toBe("Kunne ikke lagre innstillingene på enheten.");
  expect(result.current.preferences.positionSuggestions).toBe(true);
});

test("profildialog kan lukkes med Escape", async () => {
  let closed = false;
  render(
    <ProfileDetailDialog
      destination="permits"
      close={() => {
        closed = true;
      }}
    />,
  );
  await userEvent.setup().keyboard("{Escape}");
  expect(closed).toBe(true);
});

test("fiskeøkt kan startes, få fangst, korrigeres og stoppes", () => {
  const repository = createMemoryFishingLogRepository();
  const { result } = renderHook(() => useEasyFiskController(repository));
  act(() => {
    result.current.actions.setFlow("start");
  });
  act(() => {
    result.current.actions.finishSessionFlow(undefined, 4);
  });
  expect(result.current.state.active).toBe(true);
  expect(result.current.state.sessionZone).toBe(4);

  act(() => {
    result.current.actions.addCatch({
      id: "pending",
      caughtAt: Date.now(),
      submittedAt: 0,
      sessionStart: result.current.state.startTime ?? 0,
      species: "Laks",
      result: "Gjenutsatt",
      length: 70,
      weight: 4,
      zone: "Sone 4",
      violation: false,
      late: false,
    });
  });
  expect(result.current.state.catches).toHaveLength(1);
  const catchId = result.current.state.catches[0].id;
  act(() => {
    result.current.actions.correctCatch(catchId, "Kontrollert");
  });
  expect(result.current.state.catches[0].correction).toBe("Kontrollert");

  act(() => {
    result.current.actions.setFlow("stop");
  });
  act(() => {
    result.current.actions.finishSessionFlow(false);
  });
  expect(result.current.state.active).toBe(false);
  expect(result.current.state.lastSession?.result).toBe("Nullfangst registrert");
});

test("tidligere økt og fangst kan etterregistreres", () => {
  const repository = createMemoryFishingLogRepository();
  const { result } = renderHook(() => useEasyFiskController(repository));
  const session = {
    id: "EF-OKT-1000-4000",
    start: 1_000,
    end: 4_000,
    duration: 3,
    zone: "Sone 3",
    result: "1 fangst · etterregistrert",
  };
  const catchRecord = {
    id: "pending",
    caughtAt: 2_000,
    submittedAt: 0,
    sessionStart: 1_000,
    species: "Laks" as const,
    result: "Gjenutsatt" as const,
    length: 65,
    weight: 3,
    zone: "Sone 3",
    violation: false,
    late: true,
  };
  act(() => {
    result.current.actions.addPastSession(session, [catchRecord]);
  });
  expect(result.current.state.lastSession).toEqual(session);
  expect(result.current.state.sessions).toEqual([session]);
  expect(result.current.state.catches).toHaveLength(1);
});

test("mislykket sluttlagring lar aktiv økt stå åpen for nytt forsøk", () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCompletedSession: () => operationFailed("Kunne ikke lagre fiskedata på enheten."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  act(() => result.current.actions.setFlow("start"));
  act(() => result.current.actions.finishSessionFlow(undefined, 3));
  act(() => result.current.actions.setFlow("stop"));
  act(() => result.current.actions.finishSessionFlow(false));

  expect(result.current.state.active).toBe(true);
  expect(result.current.state.lastSession).toBe(null);
  expect(result.current.state.flow).toBe("stop");
  expect(result.current.state.toast).toBe("Kunne ikke lagre fiskedata på enheten.");
});

test("mislykket fangstlagring returneres til fangstskjemaet", () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCatch: () => operationFailed("Kunne ikke lagre fangsten."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  let saveResult: ReturnType<typeof result.current.actions.addCatch> | undefined;
  act(() => {
    saveResult = result.current.actions.addCatch({
      id: "pending",
      caughtAt: Date.now(),
      submittedAt: 0,
      sessionStart: Date.now(),
      species: "Laks",
      result: "Gjenutsatt",
      length: 65,
      weight: 3,
      zone: "Sone 3",
      violation: false,
      late: false,
    });
  });

  expect(saveResult).toEqual({ ok: false, error: "Kunne ikke lagre fangsten." });
  expect(result.current.state.catches).toHaveLength(0);
});

test("mislykket etterregistrering returneres til skjemaet", () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCompletedSession: () => operationFailed("Kunne ikke lagre fisketuren."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  let saveResult: ReturnType<typeof result.current.actions.addPastSession> | undefined;
  act(() => {
    saveResult = result.current.actions.addPastSession({
      id: "EF-OKT-1000-4000",
      start: 1_000,
      end: 4_000,
      duration: 3,
      zone: "Sone 3",
      result: "Nullfangst · etterregistrert",
    });
  });

  expect(saveResult).toEqual({ ok: false, error: "Kunne ikke lagre fisketuren." });
  expect(result.current.state.lastSession).toBe(null);
});
