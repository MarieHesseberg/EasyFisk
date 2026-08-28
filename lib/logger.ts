export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
}

export const logger: Logger = {
  error(message, context) {
    console.error(`[EasyFisk] ${message}`, context ?? {});
  },
};
