export type AppMode = "demo" | "local";

export function resolveAppMode(value: string | undefined): AppMode {
  if (!value || value === "demo") return "demo";
  if (value === "local") return "local";
  throw new Error(
    "Unsupported EasyFisk mode. Use demo or local; live services are not configured.",
  );
}

// Local is a development mode with real time, not a claim of production readiness.
export const appMode = resolveAppMode(process.env.NEXT_PUBLIC_EASYFISK_MODE);
