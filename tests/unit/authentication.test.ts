import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  AUTH_METHOD_KEY,
  JWT_COOKIE_NAME,
  clearAllAuth,
  clearJwtAuth,
  getAuthMethod,
  getJwtToken,
  isJwtAuthenticated,
  setClerkAuth,
  setJwtAuth,
} from "@/lib/auth-utils";

type BrowserMockCtx = {
  restore: () => void;
  lastCookie: () => string;
  setStorageItem: (key: string, value: string) => void;
};

function installBrowserMocks(): BrowserMockCtx {
  const storage = new Map<string, string>();
  let lastCookie = "";
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  const prevLocalStorage = globalThis.localStorage;

  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  } as Storage;

  globalThis.localStorage = localStorageMock;
  globalThis.window = {
    localStorage: localStorageMock,
  } as unknown as Window & typeof globalThis;

  globalThis.document = {
    set cookie(v: string) {
      lastCookie = v;
    },
    get cookie(): string {
      return lastCookie;
    },
  } as unknown as Document;

  return {
    restore() {
      if (prevWindow === undefined) {
        delete (globalThis as { window?: Window }).window;
      } else {
        globalThis.window = prevWindow;
      }
      if (prevDocument === undefined) {
        delete (globalThis as { document?: Document }).document;
      } else {
        globalThis.document = prevDocument;
      }
      if (prevLocalStorage === undefined) {
        delete (globalThis as { localStorage?: Storage }).localStorage;
      } else {
        globalThis.localStorage = prevLocalStorage;
      }
    },
    lastCookie: () => lastCookie,
    setStorageItem: (key: string, value: string) => storage.set(key, value),
  };
}

/**
 * Feature: Authentication (Clerk + JWT cookie contract)
 * Section: constants & browser-less behaviour used by middleware and client.
 */
describe("Authentication", () => {
  describe("constants", () => {
    it("JWT cookie name is stable for middleware parity", () => {
      expect(JWT_COOKIE_NAME).toBe("auth_token");
    });

    it("auth method storage key is stable", () => {
      expect(AUTH_METHOD_KEY).toBe("auth_method");
    });
  });

  describe("without browser (SSR / unit)", () => {
    it("isJwtAuthenticated is false when localStorage is unavailable", () => {
      expect(isJwtAuthenticated()).toBe(false);
    });

    it("getAuthMethod returns none when localStorage is unavailable", () => {
      expect(getAuthMethod()).toBe("none");
    });
  });

  describe("with mocked browser", () => {
    let ctx: BrowserMockCtx;

    beforeEach(() => {
      ctx = installBrowserMocks();
    });

    afterEach(() => {
      ctx.restore();
    });

    it("setJwtAuth stores token, method, and cookie", () => {
      setJwtAuth("my-jwt-token");
      expect(getJwtToken()).toBe("my-jwt-token");
      expect(getAuthMethod()).toBe("jwt");
      expect(ctx.lastCookie()).toContain("auth_token=my-jwt-token");
      expect(ctx.lastCookie()).toContain("max-age=604800");
    });

    it("clearJwtAuth removes storage and expires cookie", () => {
      setJwtAuth("tok");
      clearJwtAuth();
      expect(getJwtToken()).toBeNull();
      expect(ctx.lastCookie()).toContain("max-age=0");
    });

    it("isJwtAuthenticated reflects token presence", () => {
      expect(isJwtAuthenticated()).toBe(false);
      setJwtAuth("x");
      expect(isJwtAuthenticated()).toBe(true);
      clearJwtAuth();
      expect(isJwtAuthenticated()).toBe(false);
    });

    it("getAuthMethod returns clerk and none for invalid stored value", () => {
      setClerkAuth();
      expect(getAuthMethod()).toBe("clerk");
      ctx.setStorageItem(AUTH_METHOD_KEY, "magic");
      expect(getAuthMethod()).toBe("none");
    });

    it("setClerkAuth clears JWT storage and cookie", () => {
      setJwtAuth("tok");
      setClerkAuth();
      expect(getJwtToken()).toBeNull();
      expect(getAuthMethod()).toBe("clerk");
      expect(ctx.lastCookie()).toContain("max-age=0");
    });

    it("clearAllAuth clears jwt and clerk paths", () => {
      setJwtAuth("tok");
      clearAllAuth();
      expect(getAuthMethod()).toBe("none");
      expect(getJwtToken()).toBeNull();

      setClerkAuth();
      clearAllAuth();
      expect(getAuthMethod()).toBe("none");
    });
  });
});
