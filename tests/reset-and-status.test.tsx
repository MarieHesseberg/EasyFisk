import { afterEach, expect, test } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { storageKeysForReset } from "../data/local-storage/reset-local-data";
import { parseReadNotices } from "../features/notifications/use-header-notices";
import { useEasyFiskController } from "../application/easy-fisk/use-easy-fisk-controller";
import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("reset selection removes only app data and includes both historic storage prefixes", () => {
  for (const key of ["easyfisk-profile-v1", "easyfisk:fishing-log:v1", "unrelated"])
    localStorage.setItem(key, "value");
  expect(storageKeysForReset("all", localStorage).sort()).toEqual(
    ["easyfisk-profile-v1", "easyfisk:fishing-log:v1"].sort(),
  );
  expect(storageKeysForReset("feedback", localStorage)).not.toContain("easyfisk-profile-v1");
  expect(storageKeysForReset("documents", localStorage)).toContain("easyfisk:permit-purchases:v1");
});
test("malformed read receipts never hide unread notifications", () => {
  expect(parseReadNotices("broken")).toEqual([]);
  expect(parseReadNotices('{"id":1}')).toEqual([]);
  expect(parseReadNotices('["rules:v1",null,5]')).toEqual(["rules:v1"]);
});
test("preview remains separate from active scenario and normal mode resets payment simulation", () => {
  const repository = createMemoryFishingLogRepository();
  const { result } = renderHook(() => useEasyFiskController(repository));
  act(() => result.current.actions.selectDemoStatus("ok"));
  expect(result.current.state.selectedDemoStatus).toBe("ok");
  expect(result.current.state.demoStatus).toBe("allMissing");
  act(() => {
    result.current.actions.startStatusTest();
  });
  expect(result.current.state.demoStatus).toBe("ok");
  act(() => result.current.actions.selectDemoStatus("closed"));
  expect(result.current.state.demoStatus).toBe("ok");
  act(() => result.current.actions.setPaymentOutcome("failed"));
  act(() => result.current.actions.useActualStatus());
  expect(result.current.state.isStatusTestMode).toBe(false);
  expect(result.current.state.paymentOutcome).toBe("approved");
});
test("activating a test cannot silently discard an active fishing trip", async () => {
  const repository = createMemoryFishingLogRepository();
  const { result } = renderHook(() => useEasyFiskController(repository));
  await waitFor(() => expect(result.current.state.sessionLoading).toBe(false));
  act(() => result.current.actions.setFlow("start"));
  await act(async () => result.current.actions.finishSessionFlow(undefined, 3));
  const session = repository.getActiveSession();
  act(() => result.current.actions.selectDemoStatus("closed"));
  let started: boolean | undefined;
  act(() => {
    started = result.current.actions.startStatusTest();
  });
  expect(started).toBe(false);
  expect(repository.getActiveSession()).toEqual(session);
  expect(result.current.state.active).toBe(true);
  expect(result.current.state.isStatusTestMode).toBe(false);
});
