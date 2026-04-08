import { describe, expect, it } from "bun:test";
import {
  isAiRateLimitedError,
  isAiAuthError,
  isAiModelNotFoundError,
} from "@/lib/ai-chat-errors";

type HistoryMessage = { role: string; content: string };

function mapHistoryToGeminiFormat(history: HistoryMessage[]) {
  return history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function mapHistoryToOpenAIFormat(systemPrompt: string, history: HistoryMessage[]) {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];
  for (const msg of history) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }
  return messages;
}

function mapHistoryToAnthropicFormat(history: HistoryMessage[]) {
  return history.map((m) => ({
    role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
    content: m.content,
  }));
}

function resolveProvider(aiProvider: string | null): string {
  return aiProvider || "openai";
}

function resolveModel(overrideModel: string | undefined, dbModel: string, provider: string): string {
  if (overrideModel) return overrideModel;
  if (dbModel) return dbModel;
  switch (provider) {
    case "gemini": return "gemini-3.1-flash";
    case "anthropic": return "claude-sonnet-4-6";
    case "groq": return "llama-3.3-70b-instruct";
    default: return "gpt-5.2";
  }
}

function buildAiSenderPayload() {
  return {
    id: "ai-assistant",
    name: "AI Assistant",
    email: "",
    avatarUrl: "",
  };
}

describe("Chat API — multi-provider & Gemini", () => {
  describe("Gemini history format", () => {
    it("maps assistant to model role", () => {
      const history: HistoryMessage[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];
      const mapped = mapHistoryToGeminiFormat(history);
      expect(mapped[0]!.role).toBe("user");
      expect(mapped[1]!.role).toBe("model");
      expect(mapped[0]!.parts[0]!.text).toBe("Hello");
    });

    it("wraps content in parts array", () => {
      const mapped = mapHistoryToGeminiFormat([{ role: "user", content: "test" }]);
      expect(mapped[0]!.parts).toEqual([{ text: "test" }]);
    });

    it("empty history returns empty array", () => {
      expect(mapHistoryToGeminiFormat([])).toEqual([]);
    });
  });

  describe("OpenAI history format", () => {
    it("prepends system prompt", () => {
      const messages = mapHistoryToOpenAIFormat("You are helpful", [
        { role: "user", content: "hi" },
      ]);
      expect(messages[0]).toEqual({ role: "system", content: "You are helpful" });
      expect(messages[1]).toEqual({ role: "user", content: "hi" });
    });

    it("maps assistant role correctly", () => {
      const messages = mapHistoryToOpenAIFormat("sys", [
        { role: "assistant", content: "response" },
      ]);
      expect(messages[1]!.role).toBe("assistant");
    });
  });

  describe("Anthropic history format", () => {
    it("maps roles to user/assistant only", () => {
      const mapped = mapHistoryToAnthropicFormat([
        { role: "user", content: "q" },
        { role: "assistant", content: "a" },
        { role: "random", content: "x" },
      ]);
      expect(mapped[0]!.role).toBe("user");
      expect(mapped[1]!.role).toBe("assistant");
      expect(mapped[2]!.role).toBe("user");
    });
  });

  describe("provider resolution", () => {
    it("null defaults to openai", () => {
      expect(resolveProvider(null)).toBe("openai");
    });
    it("gemini stays gemini", () => {
      expect(resolveProvider("gemini")).toBe("gemini");
    });
    it("anthropic stays anthropic", () => {
      expect(resolveProvider("anthropic")).toBe("anthropic");
    });
    it("groq stays groq", () => {
      expect(resolveProvider("groq")).toBe("groq");
    });
  });

  describe("model resolution", () => {
    it("override takes priority", () => {
      expect(resolveModel("custom-model", "db-model", "openai")).toBe("custom-model");
    });
    it("db model used when no override", () => {
      expect(resolveModel(undefined, "db-model", "openai")).toBe("db-model");
    });
    it("gemini default", () => {
      expect(resolveModel(undefined, "", "gemini")).toBe("gemini-3.1-flash");
    });
    it("anthropic default", () => {
      expect(resolveModel(undefined, "", "anthropic")).toBe("claude-sonnet-4-6");
    });
    it("groq default", () => {
      expect(resolveModel(undefined, "", "groq")).toBe("llama-3.3-70b-instruct");
    });
    it("openai default", () => {
      expect(resolveModel(undefined, "", "openai")).toBe("gpt-5.2");
    });
  });

  describe("AI error classification for all providers", () => {
    it("Gemini 429 quota exceeded", () => {
      expect(isAiRateLimitedError({ status: 429, message: "Quota exceeded" })).toBe(true);
    });
    it("OpenAI Too Many Requests", () => {
      expect(isAiRateLimitedError({ message: "Too Many Requests" })).toBe(true);
    });
    it("quota exceeded message", () => {
      expect(isAiRateLimitedError({ message: "You have exceeded your quota" })).toBe(true);
    });
    it("Groq rate limit", () => {
      expect(isAiRateLimitedError({ statusCode: 429, message: "" })).toBe(true);
    });
    it("invalid API key auth error", () => {
      expect(isAiAuthError({ status: 401, message: "" })).toBe(true);
    });
    it("incorrect API key message", () => {
      expect(isAiAuthError({ message: "Incorrect API key provided" })).toBe(true);
    });
    it("model not found error", () => {
      expect(isAiModelNotFoundError({ message: "model not found" })).toBe(true);
    });
    it("model does not exist", () => {
      expect(isAiModelNotFoundError({ message: "The model `xyz` does not exist" })).toBe(true);
    });
  });

  describe("AI sender payload", () => {
    it("has correct shape for Pusher event", () => {
      const sender = buildAiSenderPayload();
      expect(sender.id).toBe("ai-assistant");
      expect(sender.name).toBe("AI Assistant");
      expect(sender.email).toBe("");
      expect(sender.avatarUrl).toBe("");
    });
  });
});
