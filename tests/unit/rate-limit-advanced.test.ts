import { describe, expect, test } from "bun:test";

import { MemoryRateLimiter } from "@/lib/rate-limit-memory";

/**
 * Feature: Rate limiting — stress & concurrency edge cases.
 */
describe("Rate limiting — advanced", () => {
  test("high-frequency burst is capped", () => {
    const limiter = new MemoryRateLimiter(5, 1000);
    const t = 100_000;
    for (let i = 0; i < 5; i++) {
      expect(limiter.allow("burst", t + i)).toBe(true);
    }
    expect(limiter.allow("burst", t + 5)).toBe(false);
    expect(limiter.allow("burst", t + 6)).toBe(false);
  });

  test("exactly at window boundary allows new request", () => {
    const limiter = new MemoryRateLimiter(1, 100);
    const t = 50_000;
    expect(limiter.allow("edge", t)).toBe(true);
    expect(limiter.allow("edge", t + 99)).toBe(false);
    expect(limiter.allow("edge", t + 101)).toBe(true);
  });

  test("different IPs are independent", () => {
    const limiter = new MemoryRateLimiter(2, 60_000);
    const t = 200_000;
    expect(limiter.allow("192.168.1.1", t)).toBe(true);
    expect(limiter.allow("192.168.1.1", t + 1)).toBe(true);
    expect(limiter.allow("192.168.1.1", t + 2)).toBe(false);

    expect(limiter.allow("10.0.0.1", t)).toBe(true);
    expect(limiter.allow("10.0.0.1", t + 1)).toBe(true);
    expect(limiter.allow("10.0.0.1", t + 2)).toBe(false);
  });

  test("reset only clears the specified key", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 300_000;
    limiter.allow("a", t);
    limiter.allow("b", t);
    limiter.reset("a");
    expect(limiter.allow("a", t + 1)).toBe(true);
    expect(limiter.allow("b", t + 1)).toBe(false);
  });

  test("zero maxHits always blocks", () => {
    const limiter = new MemoryRateLimiter(0, 60_000);
    expect(limiter.allow("any", 1)).toBe(false);
  });
});
