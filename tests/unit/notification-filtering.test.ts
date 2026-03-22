import { describe, expect, test } from "bun:test";

import { formatActivityNotification } from "@/lib/notification-format";

type FakeNotification = {
  id: string;
  subAccountId: string | null;
  userId: string;
  read: boolean;
  notification: string;
};

/**
 * Mirrors InfoBar's isSubAccountUser + filtering logic — pure functions extracted.
 */
const isSubAccountUser = (role: string) =>
  role === "SUBACCOUNT_USER" || role === "SUBACCOUNT_GUEST";

function filterNotificationsForUser(
  notifications: FakeNotification[],
  role: string,
  subAccountId: string,
  userId: string,
): FakeNotification[] {
  if (isSubAccountUser(role)) {
    return notifications.filter(
      (n) => n.subAccountId === subAccountId && n.userId === userId,
    );
  }
  return notifications;
}

function countUnread(notifications: FakeNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Feature: Notification filtering and unread badge display logic.
 */
describe("Notification filtering", () => {
  const all: FakeNotification[] = [
    { id: "1", subAccountId: "sa-1", userId: "u-1", read: false, notification: "Ada | assigned ticket" },
    { id: "2", subAccountId: "sa-1", userId: "u-2", read: false, notification: "Bob | closed deal" },
    { id: "3", subAccountId: "sa-2", userId: "u-1", read: true, notification: "Ada | updated pipe" },
    { id: "4", subAccountId: null, userId: "u-1", read: false, notification: "Ada | agency-wide" },
  ];

  test("agency owner sees all notifications", () => {
    const result = filterNotificationsForUser(all, "AGENCY_OWNER", "sa-1", "u-1");
    expect(result).toHaveLength(4);
  });

  test("subaccount user sees only own notifications in their subaccount", () => {
    const result = filterNotificationsForUser(all, "SUBACCOUNT_USER", "sa-1", "u-1");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("1");
  });

  test("subaccount guest has same filtering as subaccount user", () => {
    const result = filterNotificationsForUser(all, "SUBACCOUNT_GUEST", "sa-1", "u-2");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("2");
  });

  test("unread count only counts read=false", () => {
    expect(countUnread(all)).toBe(3);
    expect(countUnread(all.filter((n) => n.read))).toBe(0);
  });

  test("formatActivityNotification used in create matches parse pattern", () => {
    const text = formatActivityNotification("Ada", "assigned ticket");
    const parts = text.split(" | ");
    expect(parts[0]).toBe("Ada");
    expect(parts.slice(1).join(" | ")).toBe("assigned ticket");
  });
});
