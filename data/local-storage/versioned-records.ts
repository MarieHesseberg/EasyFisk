/** Lesing endrer ikke lagringen. Eldre lister oppgraderes ved neste vellykkede skriving. */
export function decodeRecords<T extends { id: string }>(
  value: unknown,
  validate: (record: unknown) => record is T,
): T[] {
  const records = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        "schemaVersion" in value &&
        value.schemaVersion === 1 &&
        "records" in value
      ? value.records
      : undefined;
  if (!Array.isArray(records) || !records.every(validate))
    throw new TypeError("Invalid or unsupported saved data");
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) throw new TypeError("Duplicate record IDs");
  return records;
}

export function encodeRecords<T extends { id: string }>(
  records: T[],
  validate: (record: unknown) => record is T,
) {
  return { schemaVersion: 1 as const, records: decodeRecords(records, validate) };
}
