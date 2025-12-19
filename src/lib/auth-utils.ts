 "use client";

/**
 * Auth utility functions for managing JWT and Clerk authentication
 */

// Cookie name for JWT auth
export const JWT_COOKIE_NAME = "auth_token";
export const AUTH_METHOD_KEY = "auth_method";

/**
 * Set JWT token in localStorage and cookie
 */
export function setJwtAuth(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(JWT_COOKIE_NAME, token);
    localStorage.setItem(AUTH_METHOD_KEY, "jwt");

    // Also set as cookie for middleware access
    document.cookie = `${JWT_COOKIE_NAME}=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`; // 7 days
  }
}

/**
 * Clear JWT auth
 */
export function clearJwtAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(JWT_COOKIE_NAME);
    localStorage.removeItem(AUTH_METHOD_KEY);

    // Clear cookie
    document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

/**
 * Get JWT token
 */
export function getJwtToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(JWT_COOKIE_NAME);
  }
  return null;
}

/**
 * Check if user is authenticated via JWT
 */
export function isJwtAuthenticated(): boolean {
  return !!getJwtToken();
}

/**
 * Get current auth method
 */
export function getAuthMethod(): "jwt" | "clerk" | "none" {
  if (typeof window !== "undefined") {
    const method = localStorage.getItem(AUTH_METHOD_KEY);
    if (method === "jwt" || method === "clerk") {
      return method;
    }
  }
  return "none";
}

/**
 * Set auth method to Clerk (for OAuth logins)
 */
export function setClerkAuth() {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_METHOD_KEY, "clerk");
    // Clear any JWT token if switching to Clerk
    localStorage.removeItem(JWT_COOKIE_NAME);
    document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

/**
 * Clear all auth
 */
export function clearAllAuth() {
  clearJwtAuth();
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_METHOD_KEY);
  }
}

