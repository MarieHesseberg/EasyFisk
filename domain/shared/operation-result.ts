export type OperationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code?: TechnicalErrorCode; cause?: unknown };
export type AsyncOperationResult<T> = OperationResult<T> | Promise<OperationResult<T>>;

export type TechnicalErrorCode =
  | "storage.read"
  | "storage.write"
  | "storage.delete"
  | "storage.clear"
  | "storage.invalid-data"
  | "storage.blocked";

export const technicalErrorMessages = {
  "storage.read": "error.storage.read",
  "storage.write": "error.storage.write",
  "storage.delete": "error.storage.delete",
  "storage.clear": "error.storage.clear",
  "storage.invalid-data": "error.storage.invalidData",
  "storage.blocked": "error.storage.blocked",
} as const satisfies Record<TechnicalErrorCode, string>;

export const operationSucceeded = <T>(value: T): OperationResult<T> => ({ ok: true, value });
export const operationFailed = (error: string, cause?: unknown): OperationResult<never> => ({
  ok: false,
  error,
  cause,
});

export const technicalOperationFailed = (
  code: TechnicalErrorCode,
  cause?: unknown,
): OperationResult<never> => {
  const resolvedCode = isBlockedStorageCause(cause) ? "storage.blocked" : code;
  return {
    ok: false,
    code: resolvedCode,
    error: technicalErrorMessages[resolvedCode],
    cause,
  };
};

function isBlockedStorageCause(cause: unknown) {
  return cause instanceof Error && /blocked|blokkert/i.test(`${cause.name} ${cause.message}`);
}
