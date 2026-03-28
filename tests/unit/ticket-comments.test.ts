import { describe, expect, test } from "bun:test";
import { isNewTicketAssignment } from "@/lib/ticket-assignment";

type Role = "AGENCY_OWNER" | "AGENCY_ADMIN" | "SUBACCOUNT_USER" | "SUBACCOUNT_GUEST";

function canPostComment(role: Role): boolean {
  return role === "AGENCY_OWNER" || role === "AGENCY_ADMIN";
}

function canDeleteComment(role: Role): boolean {
  return role === "AGENCY_OWNER" || role === "AGENCY_ADMIN";
}

function validateCommentContent(content: string): { ok: boolean; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Comment cannot be empty" };
  if (trimmed.length > 5000) return { ok: false, error: "Comment too long" };
  return { ok: true };
}

function buildPipelineUrl(domain: string, subAccountId: string, pipelineId: string): string {
  const base = domain.startsWith("http") ? domain : `https://${domain}`;
  return `${base}/subaccount/${subAccountId}/pipelines/${pipelineId}`;
}

describe("Ticket comments & assignment", () => {
  describe("comment role permissions", () => {
    test("AGENCY_OWNER can post comments", () => {
      expect(canPostComment("AGENCY_OWNER")).toBe(true);
    });
    test("AGENCY_ADMIN can post comments", () => {
      expect(canPostComment("AGENCY_ADMIN")).toBe(true);
    });
    test("SUBACCOUNT_USER cannot post comments", () => {
      expect(canPostComment("SUBACCOUNT_USER")).toBe(false);
    });
    test("SUBACCOUNT_GUEST cannot post comments", () => {
      expect(canPostComment("SUBACCOUNT_GUEST")).toBe(false);
    });
    test("delete follows same permission model", () => {
      expect(canDeleteComment("AGENCY_OWNER")).toBe(true);
      expect(canDeleteComment("SUBACCOUNT_USER")).toBe(false);
    });
  });

  describe("comment content validation", () => {
    test("valid comment passes", () => {
      expect(validateCommentContent("Great progress!").ok).toBe(true);
    });
    test("empty comment rejected", () => {
      expect(validateCommentContent("").ok).toBe(false);
    });
    test("whitespace-only comment rejected", () => {
      expect(validateCommentContent("   \n\t  ").ok).toBe(false);
    });
    test("very long comment rejected", () => {
      expect(validateCommentContent("x".repeat(5001)).ok).toBe(false);
    });
    test("exactly 5000 chars passes", () => {
      expect(validateCommentContent("x".repeat(5000)).ok).toBe(true);
    });
  });

  describe("assignment notification triggers", () => {
    test("null -> userId triggers email", () => {
      expect(isNewTicketAssignment(null, "user-1")).toBe(true);
    });
    test("userA -> userB triggers email", () => {
      expect(isNewTicketAssignment("user-a", "user-b")).toBe(true);
    });
    test("same user does not trigger", () => {
      expect(isNewTicketAssignment("user-a", "user-a")).toBe(false);
    });
    test("null -> null does not trigger", () => {
      expect(isNewTicketAssignment(null, null)).toBe(false);
    });
    test("userId -> null (unassign) does not trigger", () => {
      expect(isNewTicketAssignment("user-a", null)).toBe(false);
    });
  });

  describe("pipeline URL builder", () => {
    test("builds correct URL with domain", () => {
      const url = buildPipelineUrl("pixora.vercel.app", "sa-1", "pipe-1");
      expect(url).toBe("https://pixora.vercel.app/subaccount/sa-1/pipelines/pipe-1");
    });
    test("preserves http if already present", () => {
      const url = buildPipelineUrl("http://localhost:3000", "sa-1", "pipe-1");
      expect(url).toBe("http://localhost:3000/subaccount/sa-1/pipelines/pipe-1");
    });
  });
});
