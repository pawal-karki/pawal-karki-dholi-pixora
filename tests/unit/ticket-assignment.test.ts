import { describe, expect, test } from "bun:test";

import { isNewTicketAssignment } from "@/lib/ticket-assignment";

/**
 * Feature: Ticket assign + downstream notifications (email / activity log hooks).
 */
describe("Ticket assignment", () => {
  test("no assignee -> user triggers notification", () => {
    expect(isNewTicketAssignment(null, "user-1")).toBe(true);
  });

  test("same assignee does not trigger", () => {
    expect(isNewTicketAssignment("user-1", "user-1")).toBe(false);
  });

  test("reassign triggers notification", () => {
    expect(isNewTicketAssignment("user-1", "user-2")).toBe(true);
  });

  test("unassign (null next) does not trigger", () => {
    expect(isNewTicketAssignment("user-1", null)).toBe(false);
  });

  test("undefined previous behaves like new ticket assignment", () => {
    expect(isNewTicketAssignment(undefined, "user-2")).toBe(true);
  });
});
