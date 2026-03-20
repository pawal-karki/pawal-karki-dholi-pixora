import { describe, expect, test } from "bun:test";

import { formatActivityNotification } from "@/lib/notification-format";

/**
 * Feature: Dashboard activity notifications (stored copy format).
 */
describe("Notifications", () => {
  test("joins actor and description with pipe separator", () => {
    expect(formatActivityNotification("Ada", "closed deal | Acme")).toBe(
      "Ada | closed deal | Acme",
    );
  });

  test("handles empty description gracefully", () => {
    expect(formatActivityNotification("Ada", "")).toBe("Ada | ");
  });
});
