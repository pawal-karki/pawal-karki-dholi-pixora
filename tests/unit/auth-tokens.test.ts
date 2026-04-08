import { describe, expect, it } from "bun:test";

import {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  type JWTPayload,
} from "@/lib/auth";

/**
 * Feature: JWT token generation, verification, and password hashing.
 */
describe("Auth tokens", () => {
  const payload: JWTPayload = {
    userId: "user-abc-123",
    email: "test@pixora.app",
    role: "AGENCY_OWNER",
  };

  describe("generateToken + verifyToken round-trip", () => {
    it("generates a valid JWT that can be verified", () => {
      const token = generateToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(payload.userId);
      expect(decoded!.email).toBe(payload.email);
      expect(decoded!.role).toBe(payload.role);
    });

    it("includes standard JWT claims (iat, exp)", () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token) as JWTPayload & {
        iat: number;
        exp: number;
      };
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe("verifyToken negative cases", () => {
    it("returns null for garbage string", () => {
      expect(verifyToken("not.a.jwt")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(verifyToken("")).toBeNull();
    });

    it("returns null for tampered token", () => {
      const token = generateToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(verifyToken(tampered)).toBeNull();
    });
  });

  describe("password hashing", () => {
    it("hashPassword produces bcrypt hash", async () => {
      const hash = await hashPassword("Secret123");
      expect(hash).toMatch(/^\$2[aby]?\$/);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("verifyPassword matches correct password", async () => {
      const hash = await hashPassword("MyPass!");
      expect(await verifyPassword("MyPass!", hash)).toBe(true);
    });

    it("verifyPassword rejects wrong password", async () => {
      const hash = await hashPassword("Correct");
      expect(await verifyPassword("Wrong", hash)).toBe(false);
    });

    it("same password produces different hashes (salt)", async () => {
      const h1 = await hashPassword("Same");
      const h2 = await hashPassword("Same");
      expect(h1).not.toBe(h2);
    });
  });
});
