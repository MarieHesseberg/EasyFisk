import { afterEach, expect, test } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository";
import type { CatchRecord } from "../domain/catches/catch";

afterEach(cleanup);

test("trip identity survives reload and links multiple catches through completion", async () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const repository = createLocalStorageFishingLogRepository(storage);
  const first = renderHook(() => useEasyFiskController(repository));
  await waitFor(() =>
    expect(first.result.current.state.logLoading || first.result.current.state.sessionLoading).toBe(
      false,
    ),
  );
  act(() => first.result.current.actions.setFlow("start"));
  await act(async () => {
    await first.result.current.actions.finishSessionFlow(undefined, 3);
  });
  const active = repository.getActiveSession()!;
  expect(active.id).toBeTruthy();
  first.unmount();

  const reopenedRepository = createLocalStorageFishingLogRepository(storage);
  const restored = renderHook(() => useEasyFiskController(reopenedRepository));
  await waitFor(() =>
    expect(
      restored.result.current.state.logLoading || restored.result.current.state.sessionLoading,
    ).toBe(false),
  );
  expect(restored.result.current.state.sessionId).toBe(active.id);
  const record: CatchRecord = {
    id: "pending",
    caughtAt: active.startTime,
    submittedAt: active.startTime,
    sessionStart: active.startTime,
    species: "Laks",
    result: "Gjenutsatt",
    length: 60,
    weight: 2,
    zone: "Sone 3",
    violation: false,
    late: false,
  };
  await act(async () => {
    expect((await restored.result.current.actions.addCatch(record)).ok).toBe(true);
  });
  await act(async () => {
    expect((await restored.result.current.actions.addCatch(record)).ok).toBe(true);
  });
  act(() => restored.result.current.actions.setFlow("stop"));
  await act(async () => {
    await restored.result.current.actions.finishSessionFlow(false);
  });
  const reloaded = createLocalStorageFishingLogRepository(storage);
  expect(reloaded.listSessions()[0]).toMatchObject({
    id: active.id,
    zoneId: 3,
    result: "2 fangster",
  });
  expect(reloaded.getActiveSession()).toBeNull();
  const catches = reloaded.listCatches();
  expect(catches).toHaveLength(2);
  expect(new Set(catches.map((item) => item.id)).size).toBe(2);
  expect(catches.every((item) => item.sessionId === active.id && item.zoneId === 3)).toBe(true);
});
