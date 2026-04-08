import { describe, expect, it, beforeEach, afterEach } from "bun:test";

const JWT_COOKIE_NAME = "auth_token";
const AUTH_METHOD_KEY = "auth_method";

const mockStorage = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
};

let cookieJar = "";

function setJwtAuth(token: string) {
  mockLocalStorage.setItem(JWT_COOKIE_NAME, token);
  mockLocalStorage.setItem(AUTH_METHOD_KEY, "jwt");
  cookieJar = `${JWT_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

function clearJwtAuth() {
  mockLocalStorage.removeItem(JWT_COOKIE_NAME);
  mockLocalStorage.removeItem(AUTH_METHOD_KEY);
  cookieJar = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
}

function getJwtToken(): string | null {
  return mockLocalStorage.getItem(JWT_COOKIE_NAME);
}

function isJwtAuthenticated(): boolean {
  return !!getJwtToken();
}

function getAuthMethod(): "jwt" | "clerk" | "none" {
  const method = mockLocalStorage.getItem(AUTH_METHOD_KEY);
  if (method === "jwt" || method === "clerk") return method;
  return "none";
}

function setClerkAuth() {
  mockLocalStorage.setItem(AUTH_METHOD_KEY, "clerk");
  mockLocalStorage.removeItem(JWT_COOKIE_NAME);
  cookieJar = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
}

function clearAllAuth() {
  clearJwtAuth();
  mockLocalStorage.removeItem(AUTH_METHOD_KEY);
}

describe("Auth utils (browser-simulated)", () => {
  beforeEach(() => {
    mockStorage.clear();
    cookieJar = "";
  });

  describe("setJwtAuth", () => {
    it("stores token in localStorage", () => {
      setJwtAuth("my-jwt-token");
      expect(mockLocalStorage.getItem(JWT_COOKIE_NAME)).toBe("my-jwt-token");
    });

    it("sets auth method to jwt", () => {
      setJwtAuth("token123");
      expect(mockLocalStorage.getItem(AUTH_METHOD_KEY)).toBe("jwt");
    });

    it("sets cookie with 7-day expiry", () => {
      setJwtAuth("tok");
      expect(cookieJar).toContain("auth_token=tok");
      expect(cookieJar).toContain("max-age=604800");
    });
  });

  describe("clearJwtAuth", () => {
    it("removes token from localStorage", () => {
      setJwtAuth("tok");
      clearJwtAuth();
      expect(mockLocalStorage.getItem(JWT_COOKIE_NAME)).toBeNull();
    });

    it("removes auth method", () => {
      setJwtAuth("tok");
      clearJwtAuth();
      expect(mockLocalStorage.getItem(AUTH_METHOD_KEY)).toBeNull();
    });

    it("clears cookie with max-age=0", () => {
      setJwtAuth("tok");
      clearJwtAuth();
      expect(cookieJar).toContain("max-age=0");
    });
  });

  describe("getJwtToken", () => {
    it("returns token when set", () => {
      setJwtAuth("abc");
      expect(getJwtToken()).toBe("abc");
    });

    it("returns null when not set", () => {
      expect(getJwtToken()).toBeNull();
    });
  });

  describe("isJwtAuthenticated", () => {
    it("true when token exists", () => {
      setJwtAuth("tok");
      expect(isJwtAuthenticated()).toBe(true);
    });

    it("false when no token", () => {
      expect(isJwtAuthenticated()).toBe(false);
    });

    it("false after clear", () => {
      setJwtAuth("tok");
      clearJwtAuth();
      expect(isJwtAuthenticated()).toBe(false);
    });
  });

  describe("getAuthMethod", () => {
    it("returns jwt when set to jwt", () => {
      setJwtAuth("tok");
      expect(getAuthMethod()).toBe("jwt");
    });

    it("returns clerk when set to clerk", () => {
      setClerkAuth();
      expect(getAuthMethod()).toBe("clerk");
    });

    it("returns none when nothing set", () => {
      expect(getAuthMethod()).toBe("none");
    });

    it("returns none for invalid method value", () => {
      mockLocalStorage.setItem(AUTH_METHOD_KEY, "magic");
      expect(getAuthMethod()).toBe("none");
    });
  });

  describe("setClerkAuth", () => {
    it("sets auth method to clerk", () => {
      setClerkAuth();
      expect(mockLocalStorage.getItem(AUTH_METHOD_KEY)).toBe("clerk");
    });

    it("removes any JWT token", () => {
      setJwtAuth("tok");
      setClerkAuth();
      expect(mockLocalStorage.getItem(JWT_COOKIE_NAME)).toBeNull();
    });

    it("clears JWT cookie", () => {
      setJwtAuth("tok");
      setClerkAuth();
      expect(cookieJar).toContain("max-age=0");
    });
  });

  describe("clearAllAuth", () => {
    it("clears JWT token", () => {
      setJwtAuth("tok");
      clearAllAuth();
      expect(getJwtToken()).toBeNull();
    });

    it("clears auth method", () => {
      setJwtAuth("tok");
      clearAllAuth();
      expect(getAuthMethod()).toBe("none");
    });

    it("clears Clerk auth method too", () => {
      setClerkAuth();
      clearAllAuth();
      expect(getAuthMethod()).toBe("none");
    });

    it("is safe to call when nothing is set", () => {
      clearAllAuth();
      expect(getAuthMethod()).toBe("none");
      expect(getJwtToken()).toBeNull();
    });
  });
});
