import { describe, expect, test } from "bun:test";

import { parseContactMessageBody } from "@/lib/contact-payload";

/**
 * Feature: Contact form — comprehensive validation (frontend + API parity).
 */
describe("Contact form validation — comprehensive", () => {
  test("all fields present and trimmed", () => {
    const r = parseContactMessageBody({
      name: "  Pawal  ",
      email: " pawal@test.com ",
      subject: "  Billing  ",
      message: "  I need help with billing  ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Pawal");
      expect(r.data.email).toBe("pawal@test.com");
      expect(r.data.subject).toBe("Billing");
      expect(r.data.message).toBe("I need help with billing");
    }
  });

  test("subject is optional", () => {
    const r = parseContactMessageBody({
      name: "A",
      email: "a@b.com",
      message: "Hi",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.subject).toBeUndefined();
  });

  test("empty subject string is treated as absent", () => {
    const r = parseContactMessageBody({
      name: "A",
      email: "a@b.com",
      subject: "   ",
      message: "Hi",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.subject).toBeUndefined();
  });

  test("whitespace-only name fails", () => {
    expect(
      parseContactMessageBody({ name: "   ", email: "a@b.com", message: "x" }).ok,
    ).toBe(false);
  });

  test("whitespace-only email fails", () => {
    expect(
      parseContactMessageBody({ name: "A", email: "   ", message: "x" }).ok,
    ).toBe(false);
  });

  test("whitespace-only message fails", () => {
    expect(
      parseContactMessageBody({ name: "A", email: "a@b.com", message: "   " }).ok,
    ).toBe(false);
  });

  test("numeric values are coerced to strings", () => {
    const r = parseContactMessageBody({
      name: 123,
      email: 456,
      message: 789,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("123");
    }
  });

  test("array body fails", () => {
    expect(parseContactMessageBody([1, 2]).ok).toBe(false);
  });

  test("undefined body fails", () => {
    expect(parseContactMessageBody(undefined).ok).toBe(false);
  });
});
