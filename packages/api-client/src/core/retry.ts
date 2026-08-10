export type RetryConfig = {
  maxRetries: number;
  baseDelayMs: number;
  /** Only these methods are retried by default -- retrying a mutating request risks duplicate side effects. */
  retryableMethods: readonly string[];
  /** Status codes worth retrying (network errors always are). 429/502/503/504 are transient by nature. */
  retryableStatusCodes: readonly number[];
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 300,
  retryableMethods: ["GET"],
  retryableStatusCodes: [429, 502, 503, 504],
};

export function backoffDelayMs(attempt: number, baseDelayMs: number): number {
  return baseDelayMs * 2 ** attempt;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
