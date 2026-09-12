import { expect, test } from "@playwright/test";

const viewports = [
  { name: "iphone", width: 390, height: 844 },
  { name: "android", width: 412, height: 915 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`hjemskjermen beholder utseendet på ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
      animations: "disabled",
      fullPage: viewport.name !== "desktop",
      // Chromium rasteriserer skrifter litt forskjellig på Windows og Linux i CI.
      // Grensen tåler dette, men fanger fortsatt tydelige layout- og stilendringer.
      maxDiffPixelRatio: 0.08,
    });
  });
}

test("språkvalget følger brukeren mellom faner og etter refresh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { name: "Your fishing overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documents missing" })).toBeVisible();
  await expect(
    page.getByText(
      "Register a valid fishing permit, valid disinfection, and the national fishing fee or an exemption before you start.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Not registered — add documentation").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Bytt til norsk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Permits", exact: true })).toBeVisible();
  await expect(page.locator(".phone-app")).not.toContainText(
    /REGLER OPPDATERT|Når én|Minstemålet|avlivede|De øvrige/,
  );

  await page.locator(".document-overview button").filter({ hasText: "Permits" }).click();
  const documents = page.getByRole("dialog", { name: "My fishing permits" });
  await documents.getByRole("button", { name: /Register permit/ }).click();
  await expect(documents.getByLabel("Angler's name *")).toBeVisible();
  await expect(documents.getByLabel("Permit type *").getByRole("option")).toHaveText([
    "Choose",
    "Day permit",
    "Week permit",
    "Season permit",
    "Group permit",
    "Other",
  ]);
  await expect(documents).not.toContainText(
    /Kopier opplysningene|Lokal dokumentmappe|Navn på fiskeren|Utsteder|Gyldig fra|Lagre dokument|Avbryt/,
  );
  await documents.getByLabel("Angler's name *").fill("Tourist Angler");
  await documents.getByLabel("Issuer / seller *").fill("Mandalselva Elveeigarlag");
  await documents.getByLabel("Permit type *").selectOption({ label: "Day permit" });
  await documents
    .getByLabel("Watercourse, zone and subzone, if applicable *")
    .fill("Mandalselva · Zone 3");
  await documents.getByLabel("Valid from (Norwegian time) *").fill("2026-08-21T18:00");
  await documents.getByLabel("Valid until (Norwegian time) *").fill("2026-08-20T18:00");
  await documents.getByRole("button", { name: "Save document" }).click();
  await expect(documents.getByRole("alert")).toHaveText(
    "The end time must be after the start time.",
  );
  await documents.getByRole("button", { name: "Cancel" }).click();
  await documents.locator("button.back").click();

  await page.locator(".document-overview button").filter({ hasText: "Disinfection" }).click();
  const disinfection = page.getByRole("dialog", { name: "Disinfection" });
  await disinfection.getByRole("button", { name: "Register disinfection" }).click();
  await expect(
    disinfection.getByLabel("Station / person who performed the disinfection *"),
  ).toBeVisible();
  await expect(disinfection.getByLabel("Equipment disinfected *")).toBeVisible();
  await disinfection.getByRole("button", { name: "Cancel" }).click();
  await disinfection.locator("button.back").click();

  await page
    .locator(".document-overview button")
    .filter({ hasText: "National fishing fee" })
    .click();
  const fee = page.getByRole("dialog", { name: "National fishing fee" });
  await fee.getByRole("button", { name: "Register national fishing fee" }).click();
  await expect(fee.getByLabel("Calendar year *")).toBeVisible();
  await expect(fee.getByLabel("Fee / exemption *").getByRole("option")).toHaveText([
    "Choose",
    "Individual",
    "Family",
    "Under 18 — exempt",
    "Other exemption",
  ]);
  await fee.getByRole("button", { name: "Cancel" }).click();
  await fee.locator("button.back").click();

  await page.getByRole("button", { name: "Permits", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Buy fishing permit" })).toBeVisible();
  await expect(page.getByText("Choose main zone")).toBeVisible();
  await expect(page.locator(".phone-app")).not.toContainText(
    /Valgt fiskedøgn|Ett kort dekker|Sju sammenhengende|Inatur oppgir|Hele sone/,
  );

  const shop = page.locator(".permit-shop-screen");
  const dayPermit = shop.locator("article").filter({ hasText: "Zone 3 day permit" });
  await dayPermit.getByRole("button", { name: "View permit" }).click();
  await expect(shop.getByRole("heading", { name: "Equipment and facilities" })).toBeVisible();
  await expect(shop.getByRole("heading", { name: "Requirements before fishing" })).toBeVisible();
  await expect(shop).not.toContainText(
    /Tilbake til|PRODUKTINFORMASJON|Veiledende|Utstyr og|Krav før|Aldersregler|Fangst og rapportering|Kontakt selger/,
  );
  await shop.getByRole("button", { name: /20.*August 2026/ }).click();
  await shop.getByRole("button", { name: "Continue to purchase" }).click();
  await shop.getByLabel("Full name").fill("Tourist Angler");
  await shop.getByLabel("Date of birth").fill("1990-05-12");
  await shop.getByLabel("Email").fill("tourist@example.com");
  await shop.getByLabel("Phone").fill("98765432");
  await shop.getByRole("button", { name: "Next · requirements and participants" }).click();
  await shop.getByLabel(/I have read and understood/).check();
  await shop.getByLabel(/I accept the terms/).check();
  await shop.getByRole("button", { name: "Next · review" }).click();
  await shop.getByLabel(/I confirm that the information is correct/).check();
  await shop.getByRole("button", { name: "Continue to test payment" }).click();
  await shop.getByRole("button", { name: "Pay 455 kr" }).click();
  await expect(shop.getByRole("status")).toContainText("Your fishing permit has been saved");
  await expect(shop).not.toContainText(
    /Fiskedato|Kortinnehaver|Fødselsdato|Deltakere|fiskekrav|Kontroller bestillingen|Grunnpris|Totalt beløp|Testbetaling godkjent|Bestillingsnummer|Gyldig fra|Utsteder/,
  );
  await shop.getByRole("button", { name: "Back to home" }).click();

  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(page.getByRole("heading", { name: "More" })).toBeVisible();
  await expect(page.locator(".phone-app")).not.toContainText(
    /Mine fiskekort|Aktive, kommende|Gyldighet og|Varsler og|Regelendringer|Profil og personvern|Språk, samtykker/,
  );

  await page.getByRole("button", { name: "Rules", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fishing rules" })).toBeVisible();
  await expect(page.getByText("Documentation", { exact: true })).toBeVisible();
  await expect(page.getByText("Fishing season", { exact: true })).toBeVisible();
  await expect(page.locator(".phone-app")).not.toContainText(
    /Sesongkvote fra|avlivede laks|gjenutsatt laks|Når 5 laks|Offisielle kilder|fullstendige regler|dagsaktuelle meldinger/,
  );

  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fishing zones" })).toBeVisible();
  await expect(page.locator(".phone-app")).not.toContainText(
    /Kontroller dagsstatus|Valgt demosone|ett kort|inkludert|Kartet er veiledende/,
  );

  await page.reload();
  await expect(page.getByRole("heading", { name: "Your fishing overview" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("statistikk er fullstendig på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: /Statistics and fishing history/ }).click();

  const statistics = page.locator(".screen:has(.stats-tabs)");
  await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
  await expect(statistics.getByText("Official catch statistics")).toBeVisible();
  await expect(
    statistics.getByRole("heading", { name: "Reported salmon by season" }),
  ).toBeVisible();
  await expect(statistics).not.toContainText(
    /Statistikk|FANGST, INNSATS|Generell statistikk|Hele Mandalselva|Velg sesong|RAPPORTERT LAKS|Offisiell fangststatistikk|SNITTVEKT|SJØØRRET|ENDRING FRA ÅRET FØR|Rapportert laks|Kilde:|Tallene gjelder/,
  );

  await statistics.getByRole("button", { name: "My catches and fishing history" }).click();
  await expect(statistics.getByRole("heading", { name: "Your statistics" })).toBeVisible();
  await expect(statistics.getByRole("heading", { name: "Personal salmon quota" })).toBeVisible();
  await expect(statistics).not.toContainText(
    /BEREGNET FRA|Din statistikk|Fisketid|Fiskeøkter|Fangster|Nullfangstøkter|Personlig laksekvote|Avlivet laks|Gjenutsatt laks|Denne sesongen|brukt|igjen/,
  );
});

test("tilbakemelding og profildetaljer er fullstendig på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "More", exact: true }).click();

  await page.getByRole("button", { name: /Angler profile/ }).click();
  let dialog = page.getByRole("dialog", { name: "Profile and privacy" });
  await expect(dialog.getByText("Name", { exact: true })).toBeVisible();
  await expect(dialog.getByText("English", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save settings" })).toBeVisible();
  await expect(dialog).not.toContainText(
    /Fiskerprofil|Navn|Telefon|Språk|Personvern|Brukes bare|Innstillingene/,
  );
  await dialog.getByRole("button", { name: /Back/ }).click();

  await page.getByRole("button", { name: /Notifications and closures/ }).click();
  dialog = page.getByRole("dialog", { name: "Notifications and closures" });
  await expect(dialog.getByText("My notifications")).toBeVisible();
  await expect(dialog.getByText("Emergency closure")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save notification settings" })).toBeVisible();
  await expect(dialog).not.toContainText(
    /Mine varsler|Akutt stengning|Varsle dersom|Høy vanntemperatur|Regelendringer|Lagre varsel/,
  );
  await dialog.getByRole("button", { name: /Back/ }).click();

  await page.getByRole("button", { name: "Create report" }).click();
  dialog = page.getByRole("dialog", { name: "Feedback" });
  await expect(dialog.getByText("What would you like to report?")).toBeVisible();
  await dialog.getByRole("button", { name: "Illegal or suspicious fishing" }).click();
  await dialog
    .getByPlaceholder(/Describe what you observed/)
    .fill("Observed suspicious fishing near the river bank.");
  await dialog.getByRole("button", { name: "Review report" }).click();
  await expect(dialog.getByRole("heading", { name: "Is the information correct?" })).toBeVisible();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Submit report" }).click();
  await expect(dialog.getByRole("heading", { name: "Thank you for reporting this" })).toBeVisible();
  await expect(dialog).not.toContainText(
    /MELDINGEN|meldte fra|REFERANSE|Send en ny melding|KATEGORI|BESKRIVELSE|POSISJON/,
  );
});

test("regelsenteret er fullstendig på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "Rules", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Fishing rules" })).toBeVisible();
  const rules = page.locator(".rules-screen");
  const sections = page.locator(".rule-center article > button");
  const count = await sections.count();
  const norwegianRuleText =
    /Fiskekortet|Fisketider|Tillatte agn|Døgnkvot|fiskerdøgn|Sesongkvot|Regler oppdatert|avlivet|gjenutsatt|Størrelse, utstyr|ekstraordinære forhold|Fangstrapportering|fiskeinnsats|Soneregler|Gyldig område|Allmenne hensyn|grunneiere|skal rapporteres|ikke tillatt/;
  for (let index = 0; index < count; index += 1) {
    const button = sections.nth(index);
    if ((await button.getAttribute("aria-expanded")) !== "true") await button.click();
    await expect(button.locator("xpath=..")).not.toContainText(norwegianRuleText);
  }

  await sections.filter({ hasText: "Documentation" }).click();
  await expect(
    page.getByText("The fishing permit is personal and must be issued in the angler's name."),
  ).toBeVisible();
  await sections.filter({ hasText: "Catch reporting" }).click();
  await expect(
    page.getByText(
      "Catches must be reported continuously, as soon as possible and within 2 hours.",
    ),
  ).toBeVisible();
  await sections.filter({ hasText: "General conduct" }).click();
  await expect(
    rules.getByText(
      "Take all waste with you. Do not fell trees or break branches. Open fires are prohibited from 15 April to 15 September.",
    ),
  ).toBeVisible();
  await expect(rules).not.toContainText(
    /REGLER FOR|GJELDER ALLE|Generelle regler|Fiskekortet|Fisketider|Tillatte agn|Døgnkvot|fiskerdøgn|Sesongkvot|Regler oppdatert|avlivet|gjenutsatt|Størrelse, utstyr|ekstraordinære forhold|Fangstrapportering|fiskeinnsats|Soneregler|Gyldig område|Allmenne hensyn|grunneiere|skal rapporteres|ikke tillatt/,
  );
});

test("oppstart og juridisk status er fullstendig på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();

  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: /Status engine/ }).click();
  const statusDialog = page.getByRole("dialog", { name: "Status engine" });
  await statusDialog.getByLabel("Scenario").selectOption("ok");
  await statusDialog.getByRole("button", { name: "Activate and test selected scenario" }).click();

  await page.getByRole("button", { name: "START FISHING" }).click();
  const flow = page.getByRole("dialog", { name: "Start fishing" });
  await expect(flow.getByRole("heading", { name: "You are ready to fish" })).toBeVisible();
  await expect(flow).not.toContainText(
    /Kan ikke|Krever bekreftelse|Gyldig tidsrom|Gjeldende år|Kvoter og|Temperatur og|Fiskesesong|originalene er ikke/,
  );

  await flow.getByRole("button", { name: "I have checked the originals · continue" }).click();
  await expect(flow.getByRole("heading", { name: "Find the correct fishing zone" })).toBeVisible();
  await flow.getByRole("button", { name: "Choose zone manually" }).click();
  await expect(flow.getByText("Main zone", { exact: true })).toBeVisible();
  await flow.getByLabel("Main zone").selectOption("3");
  await flow.getByRole("button", { name: "Confirm zone and view rules" }).click();
  await expect(flow.getByRole("heading", { name: "Before you start in Zone 3" })).toBeVisible();
  await expect(flow).not.toContainText(
    /REGLER FOR|Før du starter|Redskap|Kvote|Fangst|Bevegelig fiske|Rapporteres|gjenutsatte/,
  );
  await flow.getByLabel("I have read and understood the rules").check();
  await flow.getByRole("button", { name: "Start fishing in Zone 3" }).click();

  await expect(page.getByText("The fishing session has started in Zone 3")).toBeVisible();
  await expect(page.getByText("ACTIVE FISHING SESSION")).toBeVisible();
  await expect(page.locator(".active-session")).not.toContainText(
    /AKTIV FISKEØKT|Startet i dag|Registrer fangst|Sone og regler|Stopp ·/,
  );

  await page.getByRole("button", { name: "Register catch" }).click();
  const catchDialog = page.getByRole("dialog", { name: "Register catch" });
  await expect(catchDialog.getByRole("heading", { name: "What did you catch?" })).toBeVisible();
  await catchDialog.getByRole("button", { name: "Next · size" }).click();
  await catchDialog.getByPlaceholder("cm").fill("55");
  await catchDialog.getByPlaceholder("kg").fill("2.4");
  await catchDialog.getByRole("button", { name: "Next · rule check" }).click();
  await expect(
    catchDialog.getByRole("heading", { name: "The report has been checked" }),
  ).toBeVisible();
  await expect(catchDialog).not.toContainText(
    /Fangst|Gjenutsatt|Størrelsesregler|Minstemål|Tilbake og endre/,
  );
  await catchDialog.getByRole("button", { name: "Submit catch report" }).click();
  await expect(catchDialog.getByRole("heading", { name: "Catch report submitted" })).toBeVisible();
  await expect(catchDialog).not.toContainText(
    /Fangstrapporten|Oppdatert kvotestatus|gjenstår|Ferdig/,
  );
  await catchDialog.getByRole("button", { name: "Done" }).click();
});

test("nullfangst på en tidligere tur kan registreres helt på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "Register a previous fishing trip" }).click();

  const dialog = page.getByRole("dialog", { name: "Register a previous fishing trip" });
  await expect(dialog.getByRole("heading", { name: "When and where did you fish?" })).toBeVisible();
  await dialog.locator('input[type="date"]').fill("2026-08-01");
  await dialog.getByLabel("Start time").fill("10:00");
  await dialog.getByLabel("End time").fill("12:00");
  await dialog.getByRole("button", { name: "No · no catch" }).click();
  await dialog.getByRole("button", { name: "Next · rule check" }).click();

  await expect(
    dialog.getByRole("heading", { name: "Review the trip before submitting" }),
  ).toBeVisible();
  await expect(dialog.getByText("No catch will be recorded for the trip")).toBeVisible();
  await expect(dialog).not.toContainText(
    /Nullfangst|etterregistrert|Rapporteringsfrist|Tilbake til turen/,
  );
  await dialog.getByRole("button", { name: "Submit trip and 0 catches" }).click();
  await expect(dialog.getByRole("heading", { name: "Trip and catches registered" })).toBeVisible();
  await dialog.getByRole("button", { name: "Open history" }).click();
  await expect(page.getByRole("heading", { name: "Recent fishing sessions" })).toBeVisible();
  const historyCard = page
    .locator(".history-card")
    .filter({ hasText: "No catch · registered later" });
  await expect(historyCard).toBeVisible();
  await historyCard.click();
  const historyDetail = page.getByRole("dialog", { name: "Fishing-session details" });
  await expect(historyDetail.getByText("No catch · registered later")).toBeVisible();
  await expect(historyDetail).not.toContainText(
    /FISKEØKT|Sone|Tidspunkt|Varighet|Resultat|Nullfangst|etterregistrert/,
  );
});

test("tidligere tur med fangst registreres og vises helt på engelsk", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "Register a previous fishing trip" }).click();

  const dialog = page.getByRole("dialog", { name: "Register a previous fishing trip" });
  await dialog.locator('input[type="date"]').fill("2026-08-01");
  await dialog.getByLabel("Start time").fill("10:00");
  await dialog.getByLabel("End time").fill("12:00");
  await dialog.getByRole("button", { name: "Yes · add a catch" }).click();
  await dialog.getByRole("button", { name: "Next · register catch" }).click();

  await expect(dialog.getByRole("heading", { name: "Register the catch" })).toBeVisible();
  await dialog.getByLabel("Actual catch time").fill("11:00");
  await dialog.getByPlaceholder("cm").fill("50");
  await dialog.getByPlaceholder("kg").fill("1.8");
  await dialog.getByRole("button", { name: "Add catch and review trip" }).click();
  await expect(dialog.getByText("Catch 1: Salmon · released")).toBeVisible();
  await dialog.getByRole("button", { name: "Submit trip and 1 catch" }).click();
  await expect(dialog.getByRole("heading", { name: "Trip and catches registered" })).toBeVisible();
  await dialog.getByRole("button", { name: "Open history" }).click();

  await expect(page.getByText("Salmon · released")).toBeVisible();
  await expect(page.getByText("1 catch · registered later")).toBeVisible();
  await expect(page.locator(".activity-embedded")).not.toContainText(
    /Laks|Gjenutsatt|fangst · etterregistrert|Siste fiskeøkter|Siste fangster/,
  );
});
