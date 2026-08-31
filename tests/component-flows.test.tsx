import { afterEach, expect, test } from "vitest";
import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
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
import { StatisticsOverview } from "../features/statistics/statistics-screen";
import { calculatePersonalStatistics } from "../domain/statistics/calculate-personal-statistics";
import { useFishingLogController } from "../application/easy-fisk/use-fishing-log-controller";
import { createMemoryCatchImageRepository } from "../data/memory/create-memory-catch-image-repository";
import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository";
import { permitCatalogRepository } from "../data/repositories/permit-catalog";
import { PermitShop } from "../features/fishing-permits/permit-shop";
import { PermitCheckout } from "../features/fishing-permits/permit-checkout";
import { createTestPermitDocument } from "../features/fishing-permits/create-test-permit-document";
import { operationSucceeded } from "../domain/shared/operation-result";
import { isFishingDocument } from "../domain/documents/validate-document";
import { getDocumentReadiness } from "../domain/documents/get-document-readiness";
import { ZoneStep } from "../features/fishing-session/fishing-flow/steps/zone-step";

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

test("offisiell Mandalselva-statistikk oppdateres når sesongen endres", async () => {
  render(<StatisticsOverview />);

  expect(screen.getByText("1 045")).toBeTruthy();
  await userEvent
    .setup()
    .selectOptions(screen.getByRole("combobox", { name: "Velg sesong" }), "2023");

  expect(screen.getByText("2 691")).toBeTruthy();
  expect(screen.getByText("9 007")).toBeTruthy();
  expect(screen.getByText("206")).toBeTruthy();
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
      navigate={(screen) => {
        destination = screen;
      }}
    />,
  );
  expect(screen.getByRole("button", { name: /Hjem/ }).getAttribute("aria-current")).toBe("page");
  expect(screen.queryByRole("button", { name: /Statistikk/ })).toBeNull();
  expect(screen.getByRole("button", { name: /Fiskekort/ })).toBeTruthy();
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
  render(
    <MapScreen
      selected={3}
      setSelected={() => undefined}
      onUseZone={() => undefined}
      onBuyPermit={() => undefined}
    />,
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Finn min posisjon" }));
  expect((await screen.findByRole("status")).textContent).toContain("Posisjonstilgang ble avslått");
});

test("kartprototypen viser Holmegård-kort og et produkt i hver hovedsone", () => {
  for (const zoneId of [1, 2, 3, 4] as const) {
    expect(permitCatalogRepository.listProductsByZone(zoneId).length).toBeGreaterThan(0);
  }

  render(
    <MapScreen
      selected={2}
      setSelected={() => undefined}
      onUseZone={() => undefined}
      onBuyPermit={() => undefined}
    />,
  );

  expect(screen.getByRole("heading", { name: "Holmegård dagskort" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Holmegård sesongkort" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Rapporteringskort for sesongkort" })).toBeTruthy();
  expect(screen.getByText("2 dagskort per fiskedøgn")).toBeTruthy();
  expect(screen.getByText("15 sesongkort totalt")).toBeTruthy();
});

test("fiskekortkatalogen tilbyr strukturerte produktdata gjennom repositoryet", () => {
  const dayPermit = permitCatalogRepository.findProduct("zone-2-holmegard-day");
  const reportingPermit = permitCatalogRepository.findProduct("zone-2-holmegard-reporting");

  expect(dayPermit?.validity.startsAt).toBe("18:00");
  expect(dayPermit?.capacity.permitsPerFishingDay).toBe(2);
  expect(dayPermit?.requirements.requiresDisinfection).toBe(true);
  expect(dayPermit?.source.status).toBe("verified-public-source");
  expect(reportingPermit?.action).toBe("register-reporting-day");
  expect(reportingPermit?.requirements.requiresSeasonPermit).toBe(true);
});

test("fiskekortbutikken viser valgt sone og bruker én felles produktkatalog", async () => {
  render(<PermitShop initialZone={2} />);

  expect(screen.getByRole("button", { name: "Sone 2" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("heading", { name: "Holmegård dagskort" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Holmegård sesongkort" })).toBeTruthy();

  await userEvent
    .setup()
    .selectOptions(screen.getByLabelText("Delsone eller salgsområde"), "Fuskeland");
  expect(screen.getByRole("heading", { name: "Fuskeland gruppekort" })).toBeTruthy();

  await userEvent.setup().click(screen.getByRole("button", { name: "Sone 4" }));
  expect(screen.getByRole("heading", { name: "Lakseosen døgnkort" })).toBeTruthy();
});

test("produktregisteret har døgnkort, sesongkort og gruppekort", () => {
  const types = new Set(permitCatalogRepository.listProducts().map((product) => product.type));
  expect(types.has("day")).toBe(true);
  expect(types.has("season")).toBe(true);
  expect(types.has("group")).toBe(true);
});

test("produktregisteret dekker alle simulerte tilgjengelighetssituasjoner", () => {
  const states = new Set(
    permitCatalogRepository.listProducts().map((product) => product.availability.status),
  );

  expect(states).toEqual(
    new Set(["available", "low", "sold-out", "not-on-sale", "no-fishing-date"]),
  );
});

test("godkjent testbetaling lager et gyldig lokalt fiskekort", async () => {
  const product = permitCatalogRepository.findProduct("zone-3-day");
  if (!product) throw new Error("Testprodukt mangler");
  const saved = [] as ReturnType<typeof createTestPermitDocument>[];

  render(
    <PermitCheckout
      product={product}
      back={() => undefined}
      save={async (document) => {
        saved.push(document);
        return operationSucceeded(undefined);
      }}
    />,
  );

  await userEvent.setup().click(screen.getByRole("button", { name: "Utfør testbetaling" }));

  expect(saved).toHaveLength(1);
  expect(isFishingDocument(saved[0])).toBe(true);
  expect(getDocumentReadiness(saved).valid.permit).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("Betaling godkjent");
  expect(screen.getByText(/overlever refresh/)).toBeTruthy();
});

test("valgt testdato kan lage et utløpt kort for riktig sone", () => {
  const product = permitCatalogRepository.findProduct("zone-2-holmegard-day");
  if (!product) throw new Error("Testprodukt mangler");
  const now = Date.parse("2026-08-31T12:00:00+02:00");
  const expiredPermit = createTestPermitDocument(product, "2026-08-29", now);

  expect(getDocumentReadiness([expiredPermit], now, 2).valid.permit).toBe(false);
  expect(expiredPermit.values.area).toContain("Sone 2");
  expect(expiredPermit.values.startsAt).toBe("2026-08-29T18:00");
  expect(expiredPermit.values.endsAt).toBe("2026-08-30T17:59");
});

test("sonevalget begrenses til sonene brukerens gyldige fiskekort dekker", () => {
  render(
    <ZoneStep
      back={() => undefined}
      demoStatus="ok"
      next={() => undefined}
      selectedZone={2}
      selectZone={() => undefined}
      permittedZoneIds={[2]}
    />,
  );

  expect((screen.getByRole("option", { name: /Sone 2/ }) as HTMLOptionElement).disabled).toBe(
    false,
  );
  expect((screen.getByRole("option", { name: /Sone 3/ }) as HTMLOptionElement).disabled).toBe(true);
  expect(screen.getByText(/Andre soner kan ikke velges/)).toBeTruthy();
});

test("avbrutt og feilet testbetaling lagrer ikke fiskekort", async () => {
  const product = permitCatalogRepository.findProduct("zone-3-day");
  if (!product) throw new Error("Testprodukt mangler");
  let saves = 0;
  const user = userEvent.setup();

  render(
    <PermitCheckout
      product={product}
      back={() => undefined}
      save={async () => {
        saves += 1;
        return operationSucceeded(undefined);
      }}
    />,
  );

  await user.click(screen.getByRole("radio", { name: "Betaling avbrutt" }));
  await user.click(screen.getByRole("button", { name: "Utfør testbetaling" }));
  expect(screen.getByRole("alert").textContent).toContain("Betalingen ble avbrutt");

  await user.click(screen.getByRole("radio", { name: "Betaling feilet" }));
  await user.click(screen.getByRole("button", { name: "Utfør testbetaling" }));
  expect(screen.getByRole("alert").textContent).toContain("Testbetalingen feilet");
  expect(saves).toBe(0);
});

test("kartets kjøpsknapp åpner den felles fiskekortbutikken", async () => {
  let opened = false;
  render(
    <MapScreen
      selected={2}
      setSelected={() => undefined}
      onUseZone={() => undefined}
      onBuyPermit={() => {
        opened = true;
      }}
    />,
  );

  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Se og velg fiskekort i sone 2" }));
  expect(opened).toBe(true);
});

test("tom fangsthistorikk forklarer at ingen fangster er registrert", () => {
  render(<CatchHistoryList catches={[]} selectCatch={() => undefined} />);

  expect(screen.getByText("Ingen fangster registrert")).toBeTruthy();
});

test("feil ved lagring av innstillinger blir tilgjengelig for brukergrensesnittet", () => {
  const repository = {
    getPreferences: () => ({
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

test("fiskeøkt kan startes, få fangst, korrigeres og stoppes", async () => {
  const repository = createMemoryFishingLogRepository();
  const { result } = renderHook(() => useEasyFiskController(repository));
  act(() => {
    result.current.actions.setFlow("start");
  });
  await act(async () => {
    await result.current.actions.finishSessionFlow(undefined, 4);
  });
  expect(result.current.state.active).toBe(true);
  expect(result.current.state.sessionZone).toBe(4);

  await act(async () => {
    await result.current.actions.addCatch({
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
  await act(async () => {
    await result.current.actions.finishSessionFlow(false);
  });
  expect(result.current.state.active).toBe(false);
  expect(result.current.state.lastSession?.result).toBe("Nullfangst registrert");
});

test("tidligere økt og fangst kan etterregistreres", async () => {
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
  await act(async () => {
    await result.current.actions.addPastSession(session, [catchRecord]);
  });
  expect(result.current.state.lastSession).toEqual(session);
  expect(result.current.state.sessions).toEqual([session]);
  expect(result.current.state.catches).toHaveLength(1);
});

test("mislykket sluttlagring lar aktiv økt stå åpen for nytt forsøk", async () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCompletedSession: () => operationFailed("Kunne ikke lagre fiskedata på enheten."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  act(() => result.current.actions.setFlow("start"));
  await act(async () => void (await result.current.actions.finishSessionFlow(undefined, 3)));
  act(() => result.current.actions.setFlow("stop"));
  await act(async () => void (await result.current.actions.finishSessionFlow(false)));

  expect(result.current.state.active).toBe(true);
  expect(result.current.state.lastSession).toBe(null);
  expect(result.current.state.flow).toBe("stop");
  expect(result.current.state.toast).toBe("Kunne ikke lagre fiskedata på enheten.");
});

test("mislykket fangstlagring returneres til fangstskjemaet", async () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCatch: () => operationFailed("Kunne ikke lagre fangsten."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  let saveResult: Awaited<ReturnType<typeof result.current.actions.addCatch>> | undefined;
  await act(async () => {
    saveResult = await result.current.actions.addCatch({
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

test("mislykket etterregistrering returneres til skjemaet", async () => {
  const memoryRepository = createMemoryFishingLogRepository();
  const repository = {
    ...memoryRepository,
    saveCompletedSession: () => operationFailed("Kunne ikke lagre fisketuren."),
  };
  const { result } = renderHook(() => useEasyFiskController(repository));

  let saveResult: Awaited<ReturnType<typeof result.current.actions.addPastSession>> | undefined;
  await act(async () => {
    saveResult = await result.current.actions.addPastSession({
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

test("fangstbilde hentes tilbake fra bildelager etter ny controller", async () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
  const fishingLog = createLocalStorageFishingLogRepository(storage);
  const images = createMemoryCatchImageRepository();
  const first = renderHook(() => useFishingLogController(fishingLog, images));

  await act(async () => {
    await first.result.current.actions.saveCatch({
      id: "pending",
      caughtAt: Date.now(),
      submittedAt: 0,
      sessionStart: Date.now(),
      species: "Laks",
      result: "Gjenutsatt",
      length: 55,
      weight: 2,
      zone: "Sone 3",
      violation: false,
      late: false,
      imageName: "fangst.jpg",
      imageData: "data:image/jpeg;base64,ZmFuZ3N0",
    });
  });
  const storedId = first.result.current.state.catches[0].id;
  first.unmount();

  const second = renderHook(() => useFishingLogController(fishingLog, images));
  await waitFor(() => expect(second.result.current.state.catches).toHaveLength(1));
  await waitFor(() =>
    expect(second.result.current.state.catches[0].imageData).toBe(
      "data:image/jpeg;base64,ZmFuZ3N0",
    ),
  );

  expect(second.result.current.state.catches[0].id).toBe(storedId);
});
