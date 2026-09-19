/** App-facing repositories always allow delayed I/O. Local stores may remain synchronous. */
export type AsyncRepository<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : never;
};

/** Normalize local adapters without turning thrown errors into successful empty results. */
export function asAsyncRepository<T extends object>(source: T): AsyncRepository<T> {
  const methods = new Map<PropertyKey, unknown>();
  return new Proxy(source, {
    get(target, key) {
      if (!methods.has(key)) {
        const method = Reflect.get(target, key);
        methods.set(
          key,
          typeof method === "function"
            ? (...args: unknown[]) => Promise.resolve().then(() => method.apply(target, args))
            : method,
        );
      }
      return methods.get(key);
    },
  }) as AsyncRepository<T>;
}
