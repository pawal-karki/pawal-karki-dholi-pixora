import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import { getCurrentUserEmail } from "@/queries/auth";

// ─── Gemini call ────────────────────────────────────────────────────────────
async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: { role: string; content: string }[],
  temperature: number,
  maxTokens: number
) {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Use the model string directly (now matches real API names)
  const actualModel = model || "gemini-2.0-flash";

  const gemini = genAI.getGenerativeModel({
    model: actualModel,
    systemInstruction: systemPrompt,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  });

  const chat = gemini.startChat({
    history: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  const lastUserMsg = history[history.length - 1]?.content || "";
  const result = await chat.sendMessage(lastUserMsg);
  return result.response.text();
}

// ─── OpenAI call ────────────────────────────────────────────────────────────
async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: { role: string; content: string }[],
  temperature: number,
  maxTokens: number
) {
  const openai = new OpenAI({ apiKey });

  // Use the model string directly (now matches real API names)
  const actualModel = model || "gpt-4o";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: systemPrompt }];

  for (const msg of history) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  const completion = await openai.chat.completions.create({
    model: actualModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

// ─── Anthropic call ──────────────────────────────────────────────────────────
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: { role: string; content: string }[],
  temperature: number,
  maxTokens: number
) {
  const anthropic = new Anthropic({ apiKey });

  // Use the model string directly (now matches real API names)
  const actualModel = model || "claude-3-5-sonnet-latest";

  const messages: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of history) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  const msg = await anthropic.messages.create({
    model: actualModel,
    system: systemPrompt,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  if (msg.content[0].type === "text") {
    return msg.content[0].text;
  }
  return "Sorry, I couldn't generate a text response.";
}

// ─── Groq call ──────────────────────────────────────────────────────────────
async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: { role: string; content: string }[],
  temperature: number,
  maxTokens: number
) {
  const groq = new Groq({ apiKey });

  // Use the model string directly (now matches real API names)
  const actualModel = model || "llama-3.3-70b-versatile";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: systemPrompt }];

  for (const msg of history) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  const completion = await groq.chat.completions.create({
    model: actualModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

export async function POST(req: NextRequest) {
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, avatarUrl: true, agencyId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content, conversationId, overrideModel } = body;

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Content and conversationId are required" },
        { status: 400 }
      );
    }

    // Get conversation
    const conversation = await db.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get AI settings for the agency
    const aiSettings = await db.aISettings.findUnique({
      where: { agencyId: conversation.agencyId },
    });

    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { error: "AI is not configured. Please set up your API key in AI Settings." },
        { status: 400 }
      );
    }

    // 1) Save user message
    const userMessage = await db.chatMessage.create({
      data: {
        content,
        conversationId,
        senderUserId: user.id,
        isAiMessage: false,
      },
      include: {
        senderUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Trigger user message via Pusher
    await pusherServer.trigger(`chat-${conversationId}`, "new-message", {
      id: userMessage.id,
      content: userMessage.content,
      senderUserId: userMessage.senderUserId,
      senderUser: userMessage.senderUser,
      isAiMessage: false,
      createdAt: userMessage.createdAt,
    });

    // 2) Get recent conversation history for context
    const history = await db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { content: true, isAiMessage: true },
    });

    // 3) Build message history
    const systemPrompt =
      aiSettings.systemPrompt ||
      "You are a helpful AI assistant for a business management platform called Pixora. Help users with their queries about managing their agency, subaccounts, funnels, pipelines, and other business operations. Be concise and professional.";

    const chatHistory = history.map((msg: any) => ({
      role: msg.isAiMessage ? "assistant" : "user",
      content: msg.content,
    }));

    // 4) Call the appropriate AI provider
    // Use overrideModel from the chat UI if provided, otherwise fall back to DB setting
    const activeModel = overrideModel || aiSettings.model;
    let aiContent: string;
    const provider = aiSettings.aiProvider || "openai";

    if (provider === "gemini") {
      aiContent = await callGemini(
        aiSettings.apiKey,
        activeModel,
        systemPrompt,
        chatHistory,
        aiSettings.temperature || 0.7,
        aiSettings.maxTokens || 2000
      );
    } else if (provider === "anthropic") {
      aiContent = await callAnthropic(
        aiSettings.apiKey,
        activeModel,
        systemPrompt,
        chatHistory,
        aiSettings.temperature || 0.7,
        aiSettings.maxTokens || 2000
      );
    } else if (provider === "groq") {
      aiContent = await callGroq(
        aiSettings.apiKey,
        activeModel,
        systemPrompt,
        chatHistory,
        aiSettings.temperature || 0.7,
        aiSettings.maxTokens || 2000
      );
    } else {
      aiContent = await callOpenAI(
        aiSettings.apiKey,
        aiSettings.model,
        systemPrompt,
        chatHistory,
        aiSettings.temperature || 0.7,
        aiSettings.maxTokens || 2000
      );
    }

    // 5) Save AI response
    const aiMessage = await db.chatMessage.create({
      data: {
        content: aiContent,
        conversationId,
        senderUserId: user.id, // Linked to user who asked, but flagged as AI
        isAiMessage: true,
      },
      include: {
        senderUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Update conversation
    await db.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessage: aiContent, updatedAt: new Date() },
    });

    // Trigger AI message via Pusher
    await pusherServer.trigger(`chat-${conversationId}`, "new-message", {
      id: aiMessage.id,
      content: aiMessage.content,
      senderUserId: aiMessage.senderUserId,
      senderUser: {
        id: "ai-assistant",
        name: "AI Assistant",
        email: "",
        avatarUrl: "",
      },
      isAiMessage: true,
      createdAt: aiMessage.createdAt,
    });

    return NextResponse.json({ userMessage, aiMessage });
  } catch (error: any) {
    console.error("[AI_CHAT]", error);

    const msg = error?.message || error?.toString() || "";
    const status = error?.status || error?.statusCode;

    // Rate limit exceeded (429)
    if (status === 429 || msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota")) {
      return NextResponse.json(
        { error: "You've exceeded the API rate limit. Please wait a moment and try again, or check your plan at your AI provider's dashboard." },
        { status: 429 }
      );
    }

    // Invalid API key (401/403)
    if (status === 401 || status === 403 || msg.includes("API key") || msg.includes("Unauthorized") || msg.includes("invalid")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your API key in AI Settings and try again." },
        { status: 401 }
      );
    }

    // Model not found
    if (msg.includes("model") && (msg.includes("not found") || msg.includes("does not exist"))) {
      return NextResponse.json(
        { error: "The selected AI model is not available. Please change the model in AI Settings." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get AI response. Please try again." },
      { status: 500 }
    );
  }
}
