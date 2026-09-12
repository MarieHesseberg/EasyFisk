import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { LanguageProvider } from "../components/localization/language-provider";
import { FormError } from "../components/ui/form-error";
import { PositionStep } from "../features/fishing-session/fishing-flow/steps/position-step";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

test("an English screen contains no common Norwegian interface words", async () => {
  window.localStorage.setItem("easyfisk-language", "en");
  render(
    <LanguageProvider>
      <PositionStep back={() => undefined} next={() => undefined} />
    </LanguageProvider>,
  );

  await screen.findByRole("heading", { name: "Find the correct fishing zone" });
  await waitFor(() => {
    expect(document.body.textContent).not.toMatch(
      /\b(?:velg|tilbake|posisjon|fiskesone|tillat|lagrer|økten)\b/i,
    );
  });
});

test("technical errors render as safe English messages", async () => {
  window.localStorage.setItem("easyfisk-language", "en");
  render(
    <LanguageProvider>
      <FormError message="error.storage.read" />
    </LanguageProvider>,
  );

  expect((await screen.findByRole("alert")).textContent).toBe(
    "The data on this device could not be read. Try again.",
  );
});
