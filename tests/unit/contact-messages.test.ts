import { describe, expect, test } from "bun:test";

import { parseContactMessageBody } from "@/lib/contact-payload";

/**
 * Feature: Public contact form / agency inbox ingestion.
 */
describe("Contact messages API payload", () => {
  test("accepts minimal valid body", () => {
    const r = parseContactMessageBody({
      name: "  Ann ",
      email: "ann@example.com",
      message: " Hello ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Ann");
      expect(r.data.email).toBe("ann@example.com");
      expect(r.data.message).toBe("Hello");
      expect(r.data.subject).toBeUndefined();
    }
  });

  test("optional subject is trimmed", () => {
    const r = parseContactMessageBody({
      name: "Bob",
      email: "b@b.com",
      subject: " Billing ",
      message: "x",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.subject).toBe("Billing");
  });

  test("rejects missing fields", () => {
    const r = parseContactMessageBody({ name: "A" });
    expect(r.ok).toBe(false);
  });

  test("rejects non-object body", () => {
    expect(parseContactMessageBody(null).ok).toBe(false);
    expect(parseContactMessageBody("nope").ok).toBe(false);
  });
});
