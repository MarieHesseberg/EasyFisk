export type OperationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; cause?: unknown };

export const operationSucceeded = <T>(value: T): OperationResult<T> => ({ ok: true, value });
export const operationFailed = (error: string, cause?: unknown): OperationResult<never> => ({
  ok: false,
  error,
  cause,
});
