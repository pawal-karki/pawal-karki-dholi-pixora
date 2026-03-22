import { describe, expect, test } from "bun:test";

/**
 * Feature: Chat send route request validation (mirrors /api/chat/send logic).
 */
function validateChatSendBody(body: unknown): { ok: true; data: { content: string; conversationId: string } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Content and conversationId are required" };
  }
  const b = body as Record<string, unknown>;
  const content = typeof b.content === "string" ? b.content.trim() : "";
  const conversationId = typeof b.conversationId === "string" ? b.conversationId.trim() : "";

  if (!content || !conversationId) {
    return { ok: false, error: "Content and conversationId are required" };
  }
  return { ok: true, data: { content, conversationId } };
}

describe("Chat send validation", () => {
  test("valid body passes", () => {
    const r = validateChatSendBody({ content: "Hello", conversationId: "conv-1" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.content).toBe("Hello");
      expect(r.data.conversationId).toBe("conv-1");
    }
  });

  test("missing content fails", () => {
    expect(validateChatSendBody({ conversationId: "x" }).ok).toBe(false);
  });

  test("missing conversationId fails", () => {
    expect(validateChatSendBody({ content: "hi" }).ok).toBe(false);
  });

  test("empty strings fail", () => {
    expect(validateChatSendBody({ content: "  ", conversationId: "  " }).ok).toBe(false);
  });

  test("null body fails", () => {
    expect(validateChatSendBody(null).ok).toBe(false);
  });

  test("wrong field name (message instead of content) fails", () => {
    expect(validateChatSendBody({ message: "hi", conversationId: "c1" }).ok).toBe(false);
  });
});
