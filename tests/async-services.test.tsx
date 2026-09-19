import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useRepositoryQuery } from "../hooks/use-repository-query";
import { createAppServices } from "../data/runtime/services";
import { AppServicesProvider } from "../data/runtime/services-provider";
import { asAsyncRepository } from "../data/contracts/async-repository";
import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { usePermitCheckoutController } from "../features/fishing-permits/use-permit-checkout-controller";
import { prototypePermitCatalogRepository } from "../data/prototype/prototype-permit-catalog-repository";
import {
  emptyPermitCheckoutForm,
  type PermitPurchase,
} from "../domain/fishing-permits/permit-purchase";
import { operationSucceeded } from "../domain/shared/operation-result";
import { configureAppClock, getAppNow, systemClock } from "../domain/shared/app-clock";
import { resolveAppMode } from "../data/runtime/environment";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("failed loading is distinct from empty data and a retry recovers", async () => {
  const first = deferred<string[]>();
  const read = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce([]);
  const { result } = renderHook(() => useRepositoryQuery<string[]>(read, []));
  expect(result.current.loading).toBe(true);
  await act(async () => {
    first.reject(new Error("offline"));
  });
  expect(result.current.error).toBe("error.storage.read");
  expect(result.current.loading).toBe(false);
  await act(async () => {
    await result.current.reload();
  });
  expect(result.current).toMatchObject({ error: "", loading: false, data: [] });
});

test("an older response cannot replace a newer source or update an unmounted query", async () => {
  const old = deferred<string[]>();
  const oldRead = () => old.promise;
  const nextRead = async () => ["new user"];
  const hook = renderHook(({ read }) => useRepositoryQuery(read, []), {
    initialProps: { read: oldRead },
  });
  hook.rerender({ read: nextRead });
  await waitFor(() => expect(hook.result.current.data).toEqual(["new user"]));
  await act(async () => {
    old.resolve(["old user"]);
  });
  expect(hook.result.current.data).toEqual(["new user"]);
  const pending = deferred<string[]>();
  hook.rerender({ read: () => pending.promise });
  hook.unmount();
  await act(async () => {
    pending.resolve(["too late"]);
  });
});

test("session start waits for persistence, rejects repeated submits and survives a fresh controller", async () => {
  const memory = createMemoryFishingLogRepository();
  const writes = deferred<void>();
  const save = vi.fn(async (...args: Parameters<typeof memory.saveActiveSession>) => {
    await writes.promise;
    return memory.saveActiveSession(...args);
  });
  const services = createAppServices({
    fishingLog: { ...asMethods(memory), saveActiveSession: save },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppServicesProvider services={services}>{children}</AppServicesProvider>
  );
  const first = renderHook(() => useEasyFiskController(), { wrapper });
  await waitFor(() =>
    expect(first.result.current.state.sessionLoading || first.result.current.state.logLoading).toBe(
      false,
    ),
  );
  act(() => first.result.current.actions.setFlow("start"));
  let pending!: Promise<void>;
  act(() => {
    pending = first.result.current.actions.finishSessionFlow(undefined, 3);
  });
  await act(async () => {
    await first.result.current.actions.finishSessionFlow(undefined, 3);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(first.result.current.state.active).toBe(false);
  await act(async () => {
    writes.resolve();
    await pending;
  });
  expect(first.result.current.state.active).toBe(true);
  first.unmount();
  const restored = renderHook(() => useEasyFiskController(), { wrapper });
  await waitFor(() => expect(restored.result.current.state.active).toBe(true));
  expect(restored.result.current.state.sessionZone).toBe(3);
});

function asMethods(source: ReturnType<typeof createMemoryFishingLogRepository>) {
  const async = asAsyncRepository(source);
  return {
    listCatches: async.listCatches,
    listSessions: async.listSessions,
    getActiveSession: async.getActiveSession,
    saveCatch: async.saveCatch,
    saveCompletedSession: async.saveCompletedSession,
    updateCatchCorrection: async.updateCatchCorrection,
    saveActiveSession: async.saveActiveSession,
  };
}

test("a failed asynchronous session write does not show an active trip", async () => {
  const source = asMethods(createMemoryFishingLogRepository());
  const services = createAppServices({
    fishingLog: {
      ...source,
      saveActiveSession: async () => {
        throw new Error("offline");
      },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppServicesProvider services={services}>{children}</AppServicesProvider>
  );
  const { result } = renderHook(() => useEasyFiskController(), { wrapper });
  await waitFor(() => expect(result.current.state.sessionLoading).toBe(false));
  act(() => result.current.actions.setFlow("start"));
  await act(async () => {
    await result.current.actions.finishSessionFlow(undefined, 3);
  });
  expect(result.current.state.active).toBe(false);
  expect(result.current.state.flow).toBe("start");
  expect(result.current.state.toast).not.toBe("");
});

const buyer = {
  ...emptyPermitCheckoutForm,
  fullName: "Test Fisker",
  birthDate: "1990-05-12",
  email: "test@example.no",
  phone: "98765432",
  acceptsRules: true,
  acceptsTerms: true,
  confirmsDetails: true,
};
test("checkout locks before delayed availability and only confirms after documents are saved", async () => {
  localStorage.clear();
  const availability = deferred<ReturnType<typeof operationSucceeded<PermitPurchase[]>>>();
  const documents = deferred<ReturnType<typeof operationSucceeded<void>>>();
  const save = vi.fn(() => documents.promise);
  const savePurchase = vi.fn(async () => operationSucceeded(undefined));
  const base = createAppServices();
  const services = createAppServices({
    purchases: { ...base.purchases, list: () => availability.promise },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppServicesProvider services={services}>{children}</AppServicesProvider>
  );
  const { result } = renderHook(
    () =>
      usePermitCheckoutController({
        product: prototypePermitCatalogRepository.findProduct("zone-3-day")!,
        initialSelectedDate: "2026-08-20",
        initialForm: buyer,
        save,
        savePurchase,
        paymentOutcome: "approved",
      }),
    { wrapper },
  );
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.submit();
  });
  await act(async () => {
    await result.current.submit();
  });
  expect(savePurchase).not.toHaveBeenCalled();
  await act(async () => {
    availability.resolve(operationSucceeded([]));
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(result.current.receipt).toBeNull();
  await act(async () => {
    documents.resolve(operationSucceeded(undefined));
    await pending;
  });
  expect(result.current.step).toBe("confirmation");
  expect(savePurchase).toHaveBeenCalledTimes(2);
});

test("local mode cannot issue a test permit and unsupported live mode is rejected", async () => {
  const services = createAppServices({ mode: "local" });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppServicesProvider services={services}>{children}</AppServicesProvider>
  );
  const save = vi.fn(async () => operationSucceeded(undefined));
  const { result } = renderHook(
    () =>
      usePermitCheckoutController({
        product: prototypePermitCatalogRepository.findProduct("zone-3-day")!,
        initialForm: buyer,
        initialSelectedDate: "2026-08-20",
        save,
        savePurchase: save,
        paymentOutcome: "approved",
      }),
    { wrapper },
  );
  await act(async () => {
    await result.current.submit();
  });
  expect(save).not.toHaveBeenCalled();
  expect(result.current.receipt).toBeNull();
  expect(result.current.error).not.toBe("");
  expect(() => resolveAppMode("production")).toThrow();
});

test("domain clock can use real time without browser storage", () => {
  const restore = configureAppClock(systemClock);
  try {
    const now = vi.spyOn(Date, "now").mockReturnValue(123456789);
    expect(getAppNow()).toBe(123456789);
    now.mockRestore();
  } finally {
    restore();
  }
});
