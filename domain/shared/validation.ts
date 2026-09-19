export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function isTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    Math.abs(value) <= 8_640_000_000_000_000
  );
}
export function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
