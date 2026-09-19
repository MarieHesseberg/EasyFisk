import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository";
import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository";
import { parseStoredFishingLog } from "../data/local-storage/parse-persisted-data";
import { PositionStep } from "../features/fishing-session/fishing-flow/steps/position-step";
import { StopSessionStep } from "../features/fishing-session/fishing-flow/stop-session-step";
import { RulesScreen } from "../features/rules/rules-screen";
import { PermitReportingRegistration } from "../features/fishing-permits/permit-reporting-registration";
import { prototypePermitCatalogRepository as permitCatalogRepository } from "../data/prototype/prototype-permit-catalog-repository";
import { createTestPermitDocument } from "../features/fishing-permits/create-test-permit-document";
import { operationSucceeded } from "../domain/shared/operation-result";
import type { CatchRecord } from "../domain/catches/catch";
import { localizeZoneName } from "../lib/localize-zone-name";
import { localizeSessionResult } from "../lib/localize-session-result";

const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, "geolocation");
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalGeolocation) Object.defineProperty(navigator, "geolocation", originalGeolocation);
  else Reflect.deleteProperty(navigator, "geolocation");
});

const start = Date.now() - 3_600_000;
const caught: CatchRecord = {
  id: "existing-catch",
  sessionStart: start,
  caughtAt: start + 1000,
  submittedAt: start + 2000,
  zone: "Sone 4 · Bjåhylen",
  species: "Laks",
  result: "Gjenutsatt",
  length: 55,
  weight: 2,
  late: false,
  violation: false,
};

test("saved subzones and catch totals are readable in both languages without changing stored values", () => {
  const zone = "Sone 4 · Laudal–Kavfossen · Bjåhylen";
  expect(localizeZoneName(zone, "no")).toBe(zone);
  expect(localizeZoneName(zone, "en")).toBe("Zone 4 · Laudal–Kavfossen · Bjåhylen");
  expect(localizeSessionResult("2 fangster", "en")).toBe("2 catches");
});

test("closing a restored trip counts its catches, preserves subzone and does not duplicate history", async () => {
  const repository = createMemoryFishingLogRepository({
    activeSession: { startTime: start, zone: 4, subzone: "Bjåhylen" },
    catches: [caught, { ...caught, id: "older-catch", sessionStart: start - 86400000 }],
  });
  const { result } = renderHook(() => useEasyFiskController(repository));
  await waitFor(() => expect(result.current.state.active).toBe(true));
  act(() => result.current.actions.setFlow("stop"));
  await act(async () => {
    await result.current.actions.finishSessionFlow(false);
  });
  expect(repository.listSessions()[0]).toMatchObject({ result: "1 fangst", subzone: "Bjåhylen" });
  expect(repository.listSessions()[0].zone).toContain("Bjåhylen");
  expect(repository.listCatches()).toHaveLength(2);
  expect(repository.getActiveSession()).toBeNull();
});

test("adding a final missing catch includes earlier catches in the trip result", async () => {
  const repository = createMemoryFishingLogRepository({
    activeSession: { startTime: start, zone: 4, subzone: "Bjåhylen" },
    catches: [caught],
  });
  const { result } = renderHook(() => useEasyFiskController(repository));
  await waitFor(() => expect(result.current.state.active).toBe(true));
  act(() => result.current.actions.setFlow("stop"));
  await act(async () => {
    await result.current.actions.finishSessionFlow(true);
  });
  await act(async () => {
    await result.current.actions.addCatch({ ...caught, id: "pending", caughtAt: Date.now() });
  });
  expect(repository.listSessions()[0]).toMatchObject({ result: "2 fangster", subzone: "Bjåhylen" });
  expect(repository.listCatches()).toHaveLength(2);
});

test("map exploration cannot overwrite an active trip or start a replacement", async () => {
  const repository = createMemoryFishingLogRepository({
    activeSession: { startTime: start, zone: 4, subzone: "Bjåhylen" },
  });
  const { result } = renderHook(() => useEasyFiskController(repository));
  await waitFor(() => expect(result.current.state.active).toBe(true));
  act(() => result.current.actions.useZone(1));
  expect(result.current.state.zone).toBe(1);
  expect(result.current.state.sessionZone).toBe(4);
  expect(result.current.state.sessionSubzone).toBe("Bjåhylen");
  expect(result.current.state.flow).toBeNull();
  expect(repository.getActiveSession()?.zone).toBe(4);
});

test("selected subzone survives storage and a fresh controller while old snapshots remain readable", async () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  const repository = createLocalStorageFishingLogRepository(storage);
  const first = renderHook(() => useEasyFiskController(repository));
  await waitFor(() => expect(first.result.current.state.sessionLoading).toBe(false));
  act(() => first.result.current.actions.setFlow("start"));
  await act(async () => {
    await first.result.current.actions.finishSessionFlow(undefined, 4, "Bjåhylen");
  });
  first.unmount();
  const restoredRepository = createLocalStorageFishingLogRepository(storage);
  const restored = renderHook(() => useEasyFiskController(restoredRepository));
  await waitFor(() => expect(restored.result.current.state.sessionSubzone).toBe("Bjåhylen"));
  expect(
    parseStoredFishingLog({
      version: 2,
      catches: [caught],
      sessions: [],
      activeSession: { startTime: start, zone: 3 },
    })?.activeSession,
  ).toEqual({ startTime: start, zone: 3 });
});

test("manual position choice does not request GPS and permission denial allows manual continuation", async () => {
  const next = vi.fn();
  const getCurrentPosition = vi.fn((_success, error) =>
    error({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
  );
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });
  render(<PositionStep back={() => undefined} next={next} />);
  fireEvent.click(screen.getByRole("button", { name: "Velg sone manuelt" }));
  expect(next).toHaveBeenCalledWith();
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Tillat og finn sone" }));
  expect(getCurrentPosition).toHaveBeenCalledOnce();
  expect(next).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status").textContent).toBeTruthy();
});

test("stop screen offers completion with catches already registered", () => {
  render(
    <StopSessionStep
      cancel={() => undefined}
      finish={() => undefined}
      elapsed={100}
      startTime={start}
      zoneName="Sone 4"
      catchCount={2}
    />,
  );
  expect(screen.getByRole("button", { name: "Avslutt tur med registrerte fangster" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Nei.*nullfangst/ })).toBeNull();
});

test("a real position produces a zone suggestion and a late GPS response cannot reopen a departed step", () => {
  const next = vi.fn();
  let success!: PositionCallback;
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (callback: PositionCallback) => {
        success = callback;
      },
    },
  });
  const view = render(<PositionStep back={() => undefined} next={next} />);
  fireEvent.click(screen.getByRole("button", { name: "Tillat og finn sone" }));
  act(() => success({ coords: { latitude: 58.38, longitude: 7.53 } } as GeolocationPosition));
  expect(next).toHaveBeenCalledWith(4);
  fireEvent.click(screen.getByRole("button", { name: "Tillat og finn sone" }));
  view.unmount();
  act(() => success({ coords: { latitude: 58.03, longitude: 7.47 } } as GeolocationPosition));
  expect(next).toHaveBeenCalledTimes(1);
});

test("rules display actual permit type, area and validity instead of the mock day permit", () => {
  render(
    <RulesScreen
      demoStatus="ok"
      selectedZone={3}
      now={Date.parse("2026-08-10T12:00:00")}
      onRegisterPermit={() => undefined}
      documents={[
        {
          id: "real-context",
          kind: "permit",
          updatedAt: 0,
          values: {
            holder: "Fisker",
            area: "Sone 4",
            category: "Sesongkort",
            startsAt: "2026-06-01T00:00",
            endsAt: "2026-09-15T23:59",
          },
        },
      ]}
    />,
  );
  expect(screen.getByText(/Sesongkort · gyldig til 15.09.2026/)).toBeTruthy();
  expect(screen.getByRole("heading", { name: /Regler for Sone 4/ })).toBeTruthy();
  expect(screen.queryByText(/Døgnkort · gyldig til/)).toBeNull();
});

test("rules do not present a selected map zone as the angler's zone without a permit", () => {
  render(
    <RulesScreen
      demoStatus="ok"
      selectedZone={3}
      now={Date.parse("2026-08-10T12:00:00")}
      onRegisterPermit={() => undefined}
    />,
  );
  expect(screen.getByRole("heading", { name: "Spesifikke regler for din sone" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: /Regler for Sone/ })).toBeNull();
});

test("reporting-day registration uses the date selected on the product", () => {
  const product = permitCatalogRepository.findProduct("zone-2-holmegard-reporting")!;
  const seasonProduct = permitCatalogRepository
    .listProductsByZone(2)
    .find((item) => item.type === "season" && item.areaName === product.areaName)!;
  const save = vi.fn(() => operationSucceeded(undefined));
  render(
    <PermitReportingRegistration
      product={product}
      initialSelectedDate="2026-08-20"
      documents={[createTestPermitDocument(seasonProduct, "2026-06-01", Date.now())]}
      back={() => undefined}
      save={save}
    />,
  );
  expect((screen.getByLabelText("Fiskedato") as HTMLInputElement).value).toBe("2026-08-20");
  fireEvent.click(screen.getByRole("button", { name: "Registrer rapporteringsdøgn" }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ fishingDate: "2026-08-20" }));
});
