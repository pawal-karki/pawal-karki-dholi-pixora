import { describe, expect, it } from "bun:test";

import { MemoryRateLimiter } from "@/lib/rate-limit-memory";

describe("MemoryRateLimiter", () => {
  it("allows up to maxHits within the window", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    const t0 = 1_000_000;
    expect(limiter.allow("ip:1", t0)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 1000)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 2000)).toBe(true);
    expect(limiter.allow("ip:1", t0 + 3000)).toBe(false);
  });

  it("does not share budget across keys", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 5_000_000;
    expect(limiter.allow("a", t)).toBe(true);
    expect(limiter.allow("b", t)).toBe(true);
  });

  it("drops timestamps outside the window so budget frees after windowMs", () => {
    const limiter = new MemoryRateLimiter(2, 10_000);
    const base = 10_000_000;
    expect(limiter.allow("k", base)).toBe(true);
    expect(limiter.allow("k", base + 1000)).toBe(true);
    expect(limiter.allow("k", base + 2000)).toBe(false);
    expect(limiter.allow("k", base + 11_000)).toBe(true);
  });

  it("reset clears only the given key", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 300_000;
    expect(limiter.allow("a", t)).toBe(true);
    expect(limiter.allow("b", t)).toBe(true);
    limiter.reset("a");
    expect(limiter.allow("a", t + 1)).toBe(true);
    expect(limiter.allow("b", t + 1)).toBe(false);
  });

  it("reset then allow succeeds for same key", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const t = 1_000;
    expect(limiter.allow("x", t)).toBe(true);
    expect(limiter.allow("x", t + 1)).toBe(false);
    limiter.reset("x");
    expect(limiter.allow("x", t + 2)).toBe(true);
  });

  it("caps a high-frequency burst at maxHits", () => {
    const limiter = new MemoryRateLimiter(5, 1000);
    const t = 100_000;
    for (let i = 0; i < 5; i++) {
      expect(limiter.allow("burst", t + i)).toBe(true);
    }
    expect(limiter.allow("burst", t + 5)).toBe(false);
    expect(limiter.allow("burst", t + 6)).toBe(false);
  });

  it("allows a new hit just after the window boundary", () => {
    const limiter = new MemoryRateLimiter(1, 100);
    const t = 50_000;
    expect(limiter.allow("edge", t)).toBe(true);
    expect(limiter.allow("edge", t + 99)).toBe(false);
    expect(limiter.allow("edge", t + 101)).toBe(true);
  });

  it("treats distinct IP-like keys independently at the same timestamp", () => {
    const limiter = new MemoryRateLimiter(2, 60_000);
    const t = 200_000;
    expect(limiter.allow("192.168.1.1", t)).toBe(true);
    expect(limiter.allow("192.168.1.1", t + 1)).toBe(true);
    expect(limiter.allow("192.168.1.1", t + 2)).toBe(false);
    expect(limiter.allow("10.0.0.1", t)).toBe(true);
    expect(limiter.allow("10.0.0.1", t + 1)).toBe(true);
    expect(limiter.allow("10.0.0.1", t + 2)).toBe(false);
  });

  it("blocks every call when maxHits is zero", () => {
    const limiter = new MemoryRateLimiter(0, 60_000);
    expect(limiter.allow("any", 1)).toBe(false);
  });

  it("uses Date.now when now is omitted", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const first = limiter.allow("live");
    const second = limiter.allow("live");
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
