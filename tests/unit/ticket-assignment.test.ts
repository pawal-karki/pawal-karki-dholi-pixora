import { describe, expect, it } from "bun:test";

import { isNewTicketAssignment } from "@/lib/ticket-assignment";

describe("isNewTicketAssignment", () => {
  it("returns true when assigning from no previous assignee to a user", () => {
    expect(isNewTicketAssignment(null, "user-1")).toBe(true);
  });

  it("returns true when previous was undefined and next is set", () => {
    expect(isNewTicketAssignment(undefined, "user-2")).toBe(true);
  });

  it("returns false when assignee unchanged", () => {
    expect(isNewTicketAssignment("user-1", "user-1")).toBe(false);
  });

  it("returns true when reassigning to a different user", () => {
    expect(isNewTicketAssignment("user-1", "user-2")).toBe(true);
  });

  it("returns false when clearing assignee (null next)", () => {
    expect(isNewTicketAssignment("user-1", null)).toBe(false);
  });

  it("returns false when next is empty string (falsy)", () => {
    expect(isNewTicketAssignment(null, "")).toBe(false);
  });

  it("returns false when both previous and next are undefined", () => {
    expect(isNewTicketAssignment(undefined, undefined)).toBe(false);
  });

  it("returns false when both previous and next are null", () => {
    expect(isNewTicketAssignment(null, null)).toBe(false);
  });

  it("treats ids as case-sensitive strings", () => {
    expect(isNewTicketAssignment("ABC", "ABC")).toBe(false);
    expect(isNewTicketAssignment("ABC", "abc")).toBe(true);
  });
});
