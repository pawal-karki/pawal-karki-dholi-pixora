import { describe, expect, test } from "bun:test";

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
    test("detects HTTP 429", () => {
      expect(isAiRateLimitedError({ status: 429 })).toBe(true);
    });

    test("detects quota messages", () => {
      expect(
        isAiRateLimitedError({ message: "You exceeded your quota" }),
      ).toBe(true);
    });

    test("statusCode alias", () => {
      expect(isAiRateLimitedError({ statusCode: 429 })).toBe(true);
    });
  });

  describe("auth", () => {
    test.each([401, 403] as const)("status %p", (code) => {
      expect(isAiAuthError({ status: code })).toBe(true);
    });

    test("message heuristics", () => {
      expect(isAiAuthError({ message: "Unauthorized: invalid API key" })).toBe(
        true,
      );
    });
  });

  describe("model availability", () => {
    test("model not found", () => {
      expect(
        isAiModelNotFoundError({ message: "model abc does not exist" }),
      ).toBe(true);
    });

    test("unrelated message", () => {
      expect(isAiModelNotFoundError({ message: "network error" })).toBe(false);
    });
  });
});
