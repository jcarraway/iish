const BASE_DELAY_MS = 5_000; // 5 seconds
const MAX_DELAY_MS = 300_000; // 5 minutes

export function getRetryDelay(retryCount: number): number {
  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retryCount), MAX_DELAY_MS);
  // Add jitter: +/- 20%
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

export function shouldRetry(retryCount: number, maxRetries: number, retryable: boolean): boolean {
  return retryable && retryCount < maxRetries;
}
