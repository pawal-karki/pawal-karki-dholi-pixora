import { describe, expect, test } from "bun:test";

import { isNewTicketAssignment } from "@/lib/ticket-assignment";

/**
 * Feature: Ticket assignment — edge cases & type coercion safety.
 */
describe("Ticket assignment — advanced", () => {
  test("empty string assignee is treated as no-assign", () => {
    expect(isNewTicketAssignment(null, "")).toBe(false);
  });

  test("both undefined → no trigger", () => {
    expect(isNewTicketAssignment(undefined, undefined)).toBe(false);
  });

  test("both null → no trigger", () => {
    expect(isNewTicketAssignment(null, null)).toBe(false);
  });

  test("same user ID in different cases still matches (IDs are case-sensitive UUIDs)", () => {
    expect(isNewTicketAssignment("ABC", "ABC")).toBe(false);
    expect(isNewTicketAssignment("ABC", "abc")).toBe(true);
  });
});
