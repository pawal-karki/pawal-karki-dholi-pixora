import { describe, expect, it } from "bun:test";

import {
  isAiAuthError,
  isAiModelNotFoundError,
  isAiRateLimitedError,
} from "@/lib/ai-chat-errors";

/**
 * Feature: AI chat route — provider error classification (rate limits, keys, models).
 */
describe("AI chat errors", () => {
  describe("rate limit", () => {
    it("detects HTTP 429", () => {
      expect(isAiRateLimitedError({ status: 429 })).toBe(true);
    });

    it("detects quota messages", () => {
      expect(
        isAiRateLimitedError({ message: "You exceeded your quota" }),
      ).toBe(true);
    });

    it("statusCode alias", () => {
      expect(isAiRateLimitedError({ statusCode: 429 })).toBe(true);
    });
  });

  describe("auth", () => {
    for (const code of [401, 403] as const) {
      it(`treats HTTP ${code} as auth error`, () => {
        expect(isAiAuthError({ status: code })).toBe(true);
      });
    }

    it("message heuristics", () => {
      expect(isAiAuthError({ message: "Unauthorized: invalid API key" })).toBe(
        true,
      );
    });
  });

  describe("model availability", () => {
    it("model not found", () => {
      expect(
        isAiModelNotFoundError({ message: "model abc does not exist" }),
      ).toBe(true);
    });

    it("unrelated message", () => {
      expect(isAiModelNotFoundError({ message: "network error" })).toBe(false);
    });
  });
});
