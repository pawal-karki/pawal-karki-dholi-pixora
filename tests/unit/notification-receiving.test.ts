import { describe, expect, it } from "bun:test";

import { formatActivityNotification } from "@/lib/notification-format";

type Notification = {
  id: string;
  notification: string;
  subAccountId: string | null;
  userId: string;
  read: boolean;
  createdAt: Date;
};

function isSubAccountRole(role: string): boolean {
  return role === "SUBACCOUNT_USER" || role === "SUBACCOUNT_GUEST";
}

function filterNotificationsForRole(
  all: Notification[],
  role: string,
  subAccountId: string,
  userId: string,
): Notification[] {
  if (isSubAccountRole(role)) {
    return all.filter((n) => n.subAccountId === subAccountId && n.userId === userId);
  }
  return all;
}

function toggleSubAccountFilter(
  all: Notification[],
  showAll: boolean,
  subAccountId: string,
): Notification[] {
  if (showAll) return all;
  return all.filter((n) => n.subAccountId === subAccountId);
}

function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

function formatUnreadBadge(count: number): string {
  if (count === 0) return "";
  if (count > 9) return "9+";
  return String(count);
}

function parseNotificationText(text: string): { actor: string; message: string } | null {
  const pipeIndex = text.indexOf(" | ");
  if (pipeIndex === -1) return null;
  return {
    actor: text.substring(0, pipeIndex).trim(),
    message: text.substring(pipeIndex + 3).trim(),
  };
}

function sortByNewest(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function markAsRead(notifications: Notification[], id: string): Notification[] {
  return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

function markAllAsRead(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

describe("formatActivityNotification", () => {
  it("joins actor and description with pipe separator", () => {
    expect(formatActivityNotification("Ada", "closed deal | Acme")).toBe(
      "Ada | closed deal | Acme",
    );
  });

  it("preserves empty description after separator", () => {
    expect(formatActivityNotification("Ada", "")).toBe("Ada | ");
  });
});

describe("Notification receiving & display", () => {
  const now = new Date();
  const notifs: Notification[] = [
    { id: "n1", notification: "Ada | assigned ticket #42", subAccountId: "sa-1", userId: "u-1", read: false, createdAt: new Date(now.getTime() - 60000) },
    { id: "n2", notification: "Bob | closed deal worth Rs 5000", subAccountId: "sa-1", userId: "u-2", read: false, createdAt: new Date(now.getTime() - 30000) },
    { id: "n3", notification: "Ada | updated pipeline", subAccountId: "sa-2", userId: "u-1", read: true, createdAt: new Date(now.getTime() - 120000) },
    { id: "n4", notification: "System | agency-wide alert", subAccountId: null, userId: "u-1", read: false, createdAt: now },
    { id: "n5", notification: "Charlie | new lead added", subAccountId: "sa-1", userId: "u-3", read: true, createdAt: new Date(now.getTime() - 90000) },
  ];

  describe("role-based filtering", () => {
    it("AGENCY_OWNER sees all notifications", () => {
      expect(filterNotificationsForRole(notifs, "AGENCY_OWNER", "sa-1", "u-1")).toHaveLength(5);
    });

    it("AGENCY_ADMIN sees all notifications", () => {
      expect(filterNotificationsForRole(notifs, "AGENCY_ADMIN", "sa-1", "u-1")).toHaveLength(5);
    });

    it("SUBACCOUNT_USER sees only own in current subaccount", () => {
      const filtered = filterNotificationsForRole(notifs, "SUBACCOUNT_USER", "sa-1", "u-1");
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe("n1");
    });

    it("SUBACCOUNT_GUEST sees only own in current subaccount", () => {
      const filtered = filterNotificationsForRole(notifs, "SUBACCOUNT_GUEST", "sa-1", "u-2");
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe("n2");
    });

    it("SUBACCOUNT_USER with no matching notifications gets empty", () => {
      const filtered = filterNotificationsForRole(notifs, "SUBACCOUNT_USER", "sa-3", "u-1");
      expect(filtered).toHaveLength(0);
    });
  });

  describe("subaccount toggle filter", () => {
    it("showAll=true returns everything", () => {
      expect(toggleSubAccountFilter(notifs, true, "sa-1")).toHaveLength(5);
    });
    it("showAll=false filters to subaccount", () => {
      const filtered = toggleSubAccountFilter(notifs, false, "sa-1");
      expect(filtered).toHaveLength(3);
      expect(filtered.every((n) => n.subAccountId === "sa-1")).toBe(true);
    });
  });

  describe("unread count & badge", () => {
    it("counts unread correctly", () => {
      expect(getUnreadCount(notifs)).toBe(3);
    });
    it("all read → 0", () => {
      expect(getUnreadCount(markAllAsRead(notifs))).toBe(0);
    });
    it("badge shows number for 1-9", () => {
      expect(formatUnreadBadge(3)).toBe("3");
    });
    it("badge shows 9+ for 10+", () => {
      expect(formatUnreadBadge(15)).toBe("9+");
    });
    it("badge empty for 0", () => {
      expect(formatUnreadBadge(0)).toBe("");
    });
  });

  describe("notification text parsing", () => {
    it("parses actor and message", () => {
      const result = parseNotificationText("Ada | assigned ticket #42");
      expect(result).toEqual({ actor: "Ada", message: "assigned ticket #42" });
    });
    it("handles no pipe → null", () => {
      expect(parseNotificationText("plain text")).toBeNull();
    });
    it("handles multiple pipes", () => {
      const result = parseNotificationText("Bob | deal | worth Rs 5000");
      expect(result!.actor).toBe("Bob");
      expect(result!.message).toBe("deal | worth Rs 5000");
    });
    it("formatActivityNotification roundtrips with parse", () => {
      const text = formatActivityNotification("Charlie", "created a new funnel");
      const parsed = parseNotificationText(text);
      expect(parsed!.actor).toBe("Charlie");
      expect(parsed!.message).toBe("created a new funnel");
    });
  });

  describe("sorting by newest first", () => {
    it("most recent notification comes first", () => {
      const sorted = sortByNewest(notifs);
      expect(sorted[0]!.id).toBe("n4");
    });
    it("oldest comes last", () => {
      const sorted = sortByNewest(notifs);
      expect(sorted[sorted.length - 1]!.id).toBe("n3");
    });
  });

  describe("mark as read operations", () => {
    it("markAsRead updates single notification", () => {
      const updated = markAsRead(notifs, "n1");
      expect(updated.find((n) => n.id === "n1")!.read).toBe(true);
      expect(updated.find((n) => n.id === "n2")!.read).toBe(false);
    });

    it("markAsRead for non-existent ID is no-op", () => {
      const updated = markAsRead(notifs, "nonexistent");
      expect(updated).toEqual(notifs);
    });

    it("markAllAsRead sets all to read", () => {
      const updated = markAllAsRead(notifs);
      expect(updated.every((n) => n.read)).toBe(true);
    });

    it("markAllAsRead does not mutate original", () => {
      markAllAsRead(notifs);
      expect(notifs[0]!.read).toBe(false);
    });
  });
});
