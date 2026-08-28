import { afterEach, expect, test } from "vitest";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNavigation } from "../components/layout/bottom-navigation";
import { FeedbackForm } from "../features/feedback/feedback-form";
import { MapScreen } from "../features/map/map-screen";
import { ProfileDetailDialog } from "../features/profile/profile-detail-dialog";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository";

afterEach(cleanup);

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
  expect(result.current.state.catches).toHaveLength(1);
});
