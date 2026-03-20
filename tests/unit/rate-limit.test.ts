import { describe, expect, test } from "bun:test";

import { MemoryRateLimiter } from "@/lib/rate-limit-memory";

/**
 * Feature: Rate limiting — fixed-window counter pattern for APIs (e.g. AI / auth).
 */
describe("Rate limiting", () => {
  test("allows up to maxHits within window", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    const t0 = 1_000_000;
    expect(limiter.allow("ip:1", t0)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 1000)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 2000)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 3000)).toBe(false);
  });

  test("separate keys do not share budget", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 5_000_000;
    expect(limiter.allow("a", t)).toBe(true);
    expect(limiter.allow("b", t)).toBe(true);
  });

  test("windows expire (sliding filter by cutoff)", () => {
    const limiter = new MemoryRateLimiter(2, 10_000);
    const base = 10_000_000;
    expect(limiter.allow("k", base)).toBe(true);
    expect(limiter.allow("k", base + 1000)).toBe(true);
    expect(limiter.allow("k", base + 2000)).toBe(false);
    expect(limiter.allow("k", base + 11_000)).toBe(true);
  });

  test("reset clears key", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 1_000;
    expect(limiter.allow("x", t)).toBe(true);
    expect(limiter.allow("x", t + 1)).toBe(false);
    limiter.reset("x");
    expect(limiter.allow("x", t + 2)).toBe(true);
  });
});
