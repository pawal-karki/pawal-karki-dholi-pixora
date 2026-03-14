/**
 * Tiny fixed-window counter for IP/key rate limiting in route handlers.
 * For tests and small APIs; use Redis in production for multi-instance deployments.
 */
export class MemoryRateLimiter {
  private readonly windows = new Map<string, number[]>();
  constructor(
    private readonly maxHits: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the key is allowed; false if rate limited. */
  allow(key: string, now: number = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const stamps = this.windows.get(key)?.filter((t) => t > cutoff) ?? [];
    if (stamps.length >= this.maxHits) {
      this.windows.set(key, stamps);
      return false;
    }
    stamps.push(now);
    this.windows.set(key, stamps);
    return true;
  }

  reset(key: string): void {
    this.windows.delete(key);
  }
}
