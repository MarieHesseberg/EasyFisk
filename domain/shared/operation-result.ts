export type OperationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; cause?: unknown };
export type AsyncOperationResult<T> = OperationResult<T> | Promise<OperationResult<T>>;

export const operationSucceeded = <T>(value: T): OperationResult<T> => ({ ok: true, value });
export const operationFailed = (error: string, cause?: unknown): OperationResult<never> => ({
  ok: false,
  error,
  cause,
});
