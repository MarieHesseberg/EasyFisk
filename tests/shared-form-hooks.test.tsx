import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";

import { useFormSubmission } from "../hooks/use-form-submission";
import { useImageSelection } from "../hooks/use-image-selection";
import { useFormFields } from "../hooks/use-form-fields";
import { operationFailed } from "../domain/shared/operation-result";

test("gruppert skjemastate oppdaterer ett felt og nullstilles samlet", () => {
  const { result } = renderHook(() => useFormFields({ name: "", accepted: false }));

  act(() => {
    result.current.setField("name", "Marie");
    result.current.setField("accepted", true);
  });
  expect(result.current.fields).toEqual({ name: "Marie", accepted: true });

  act(() => result.current.reset());
  expect(result.current.fields).toEqual({ name: "", accepted: false });
});

test("bildevalg avviser ugyldig fil og kan nullstilles", () => {
  const { result } = renderHook(() => useImageSelection());

  act(() => {
    result.current.select(new File(["innhold"], "fangst.gif", { type: "image/gif" }));
  });
  expect(result.current.name).toBe("");
  expect(result.current.error).toBe("Bildet må være JPG eller PNG.");

  act(() => result.current.reset());
  expect(result.current.error).toBe("");
});

test("innsendingshook hindrer dobbel innsending mens handlingen pågår", async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let calls = 0;
  const { result } = renderHook(() => useFormSubmission("Kunne ikke sende."));

  let first!: Promise<boolean>;
  await act(async () => {
    first = result.current.run(() => {
      calls += 1;
      return pending;
    });
    await Promise.resolve();
  });
  expect(result.current.isSubmitting).toBe(true);

  let second!: boolean;
  await act(async () => {
    second = await result.current.run(() => {
      calls += 1;
    });
  });
  expect(second).toBe(false);
  expect(calls).toBe(1);

  await act(async () => {
    finish();
    expect(await first).toBe(true);
  });
  expect(result.current.isSubmitting).toBe(false);
});

test("innsendingshook gjør teknisk feil om til forståelig skjemafeil", async () => {
  const { result } = renderHook(() => useFormSubmission("Kunne ikke sende."));

  await act(async () => {
    expect(
      await result.current.run(() => {
        throw new Error("nettverk");
      }),
    ).toBe(false);
  });
  expect(result.current.error).toBe("Kunne ikke sende.");
});

test("innsendingshook beholder feilmeldingen fra et mislykket lagringsresultat", async () => {
  const { result } = renderHook(() => useFormSubmission("Generell feil."));

  await act(async () => {
    expect(
      await result.current.run(() => operationFailed("Kunne ikke lagre fiskedata på enheten.")),
    ).toBe(false);
  });

  expect(result.current.error).toBe("Kunne ikke lagre fiskedata på enheten.");
});
