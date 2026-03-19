import { describe, expect, test } from "bun:test";

import {
  AUTH_METHOD_KEY,
  JWT_COOKIE_NAME,
  getAuthMethod,
  isJwtAuthenticated,
} from "@/lib/auth-utils";

/**
 * Feature: Authentication (Clerk + JWT cookie contract)
 * Section: constants & browser-less behaviour used by middleware and client.
 */
describe("Authentication", () => {
  describe("constants", () => {
    test("JWT cookie name is stable for middleware parity", () => {
      expect(JWT_COOKIE_NAME).toBe("auth_token");
    });

    test("auth method storage key is stable", () => {
      expect(AUTH_METHOD_KEY).toBe("auth_method");
    });
  });

  describe("without browser (SSR / unit)", () => {
    test("isJwtAuthenticated is false when localStorage is unavailable", () => {
      expect(isJwtAuthenticated()).toBe(false);
    });

    test("getAuthMethod returns none when localStorage is unavailable", () => {
      expect(getAuthMethod()).toBe("none");
    });
  });
});
