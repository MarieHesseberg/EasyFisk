import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("appen har norsk språk og riktig produktnavn", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /<html lang="no">/);
  assert.match(layout, /title: "EasyFisk"/);
});

test("visuell referanse er dokumentert", async () => {
  const baseline = await readFile(new URL("../visual-baseline/README.md", import.meta.url), "utf8");

  assert.match(baseline, /iPhone-referanse/);
  assert.match(baseline, /Android-referanse/);
  assert.match(baseline, /Godkjenningskrav/);
});

test("kodebasen følger den avtalte mappestrukturen", async () => {
  const directories = [
    "components/layout",
    "components/ui",
    "data/mock",
    "data/contracts",
    "data/memory",
    "data/local-storage",
    "data/repositories",
    "domain/catches",
    "domain/fishing-rules",
    "domain/quotas",
    "domain/sessions",
    "domain/zones",
    "features/catch-report",
    "features/feedback",
    "features/fishing-session",
    "features/history",
    "features/home",
    "features/map",
    "features/profile",
    "features/rules",
    "features/statistics",
    "hooks",
    "lib",
    "styles",
  ];

  await Promise.all(
    directories.map((directory) => access(new URL(`../${directory}/`, import.meta.url))),
  );
});

test("regelverdier hentes fra ett versjonert regelgrunnlag", async () => {
  const consumers = [
    "domain/zones/zone-rules.ts",
    "domain/catches/validate-catch.ts",
    "domain/catches/reporting-deadline.ts",
    "domain/quotas/get-quota-status.ts",
    "data/mock/rule-sections.ts",
    "features/home/home-screen.tsx",
    "features/rules/rules-screen.tsx",
    "features/rules/rule-center.tsx",
    "features/catch-report/steps/catch-review-step.tsx",
  ];

  const contents = await Promise.all(
    consumers.map((file) => readFile(new URL(`../${file}`, import.meta.url), "utf8")),
  );

  contents.forEach((content) => assert.match(content, /activeFishingRules/));
  contents.forEach((content) => assert.doesNotMatch(content, /"2026-(?:06-01|08-01|08-31|09-15)"/));
});

test("pull requests kjører full kvalitetssjekk", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pull-request-check.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
});

test("funksjoner og domene er frikoblet fra mockdata", async () => {
  const sourceRoots = ["application", "components", "domain", "features", "hooks", "lib"];

  async function sourceFiles(directory) {
    const entries = await readdir(new URL(`../${directory}/`, import.meta.url), {
      withFileTypes: true,
    });
    const nested = await Promise.all(
      entries.map((entry) => {
        const path = `${directory}/${entry.name}`;
        return entry.isDirectory() ? sourceFiles(path) : [path];
      }),
    );
    return nested.flat().filter((path) => /\.[cm]?[jt]sx?$/.test(path));
  }

  const files = (await Promise.all(sourceRoots.map(sourceFiles))).flat();
  const contents = await Promise.all(
    files.map(async (file) => [
      file,
      await readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    ]),
  );
  const coupledFiles = contents.filter(([, content]) => content.includes("@/data/mock"));

  assert.deepEqual(coupledFiles, []);
});

test("ruten er liten og delegerer til applikasjonslaget", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.ok(page.split("\n").length <= 15);
  assert.match(page, /<EasyFiskApp \/>/);
});

test("responsiv stil dekker sikre områder, dynamisk høyde og redusert bevegelse", async () => {
  const responsive = await readFile(new URL("../styles/responsive.css", import.meta.url), "utf8");

  assert.match(responsive, /100dvh/);
  assert.match(responsive, /safe-area-inset-bottom/);
  assert.match(responsive, /min-height: 44px/);
  assert.match(responsive, /prefers-reduced-motion/);
});

test("interaktive valg har tilgjengelig valgt tilstand", async () => {
  const [navigation, map, statistics, rules, sessionStep, catchStep, formError] = await Promise.all(
    [
      readFile(new URL("../components/layout/bottom-navigation.tsx", import.meta.url), "utf8"),
      Promise.all([
        readFile(new URL("../features/map/map-screen.tsx", import.meta.url), "utf8"),
        readFile(
          new URL("../features/map/interactive-mandalselva-map.tsx", import.meta.url),
          "utf8",
        ),
      ]).then((files) => files.join("\n")),
      readFile(new URL("../features/statistics/statistics-screen.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../features/fishing-session/fishing-flow/steps/rules-step.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../features/history/past-session/session-details-step.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../features/history/past-session/catch-details-step.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../components/ui/form-error.tsx", import.meta.url), "utf8"),
    ],
  );

  assert.match(navigation, /aria-current=/);
  assert.match(map, /aria-pressed=/);
  assert.match(statistics, /aria-pressed=/);
  assert.match(rules, /disabled=\{!confirmed\}/);
  assert.doesNotMatch(rules, /defaultChecked/);
  assert.match(sessionStep, /aria-describedby=/);
  assert.match(sessionStep, /<FormError[\s\S]*id="past-session-error"/);
  assert.match(catchStep, /<FormError[\s\S]*id="past-catch-error"/);
  assert.match(formError, /role="alert"/);
});

test("kartknapper har minst 44 piksler berøringsflate", async () => {
  const styles = await readFile(new URL("../styles/interactive-map.css", import.meta.url), "utf8");

  assert.match(styles, /\.map-zone-switcher button\s*\{[^}]*min-height:\s*44px/s);
  assert.match(styles, /\.map-zone-popup-close\s*\{[^}]*width:\s*44px/s);
  assert.match(styles, /\.map-zone-popup-close\s*\{[^}]*height:\s*44px/s);
});

test("stilsystemet bruker egne tokens uten ubrukt Tailwind", async () => {
  const [foundations, packageFile] = await Promise.all([
    readFile(new URL("../styles/foundations.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(foundations, /--color-primary:/);
  assert.match(foundations, /--color-focus:/);
  assert.doesNotMatch(foundations, /tailwindcss/);
  assert.doesNotMatch(packageFile, /tailwindcss/);
});

test("stilfiler er små og har tydelig eierskap", async () => {
  const entries = await readdir(new URL("../styles/", import.meta.url), { withFileTypes: true });
  const styleFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".css"));
  const styles = await Promise.all(
    styleFiles.map(async (entry) => ({
      name: entry.name,
      content: await readFile(new URL(`../styles/${entry.name}`, import.meta.url), "utf8"),
    })),
  );

  const oversized = styles
    .filter(({ content }) => content.split("\n").length > 250)
    .map(({ name }) => name);
  assert.deepEqual(oversized, []);

  const allStyles = styles.map(({ content }) => content).join("\n");
  assert.doesNotMatch(allStyles, /var\(--(?:ink|muted|blue|pale|cream|line)\)/);

  for (const selector of [".more-profile-card", ".more-feedback-card", ".late-report-note"]) {
    const owners = styles.filter(({ content }) => content.includes(`${selector} {`));
    assert.equal(owners.length, 1, `${selector} skal eies av én stilfil`);
  }
});

test("delte farger bruker semantiske designtokens", async () => {
  const entries = await readdir(new URL("../styles/", import.meta.url), { withFileTypes: true });
  const featureStyles = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() && entry.name.endsWith(".css") && entry.name !== "foundations.css",
      )
      .map((entry) => readFile(new URL(`../styles/${entry.name}`, import.meta.url), "utf8")),
  );
  const combined = featureStyles.join("\n").toLowerCase();

  for (const sharedColor of [
    "#183b5930",
    "#d8e3ed",
    "#d7e0e8",
    "#e8f2fb",
    "#e8eff6",
    "#dcefe2",
    "#d39b25",
    "#745719",
    "#9b4436",
  ]) {
    assert.doesNotMatch(combined, new RegExp(sharedColor));
  }
});

test("dialoger har tilgjengelig fokusbehandling", async () => {
  const hook = await readFile(
    new URL("../hooks/use-dialog-accessibility.ts", import.meta.url),
    "utf8",
  );

  assert.match(hook, /event\.key === "Escape"/);
  assert.match(hook, /event\.key !== "Tab"/);
  assert.match(hook, /document\.body\.style\.overflow = "hidden"/);
});
