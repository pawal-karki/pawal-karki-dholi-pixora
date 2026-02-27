"use server";

import { db } from "@/lib/db";
import { getCurrentUserEmail } from "@/queries/auth";
import type { ChatType } from "@prisma/client";

// ─── Get current user for chat ────────────────────────────────────────────────
export async function getChatUser() {
  const email = await getCurrentUserEmail();
  if (!email) return null;

  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      agencyId: true,
    },
  });
}

// ─── Get conversations ────────────────────────────────────────────────────────
export async function getConversations(agencyId: string, subAccountId?: string) {
  const user = await getChatUser();
  if (!user) return [];

  return db.chatConversation.findMany({
    where: {
      agencyId,
      ...(subAccountId ? { subAccountId } : {}),
      OR: [{ userId: user.id }, { participantUserId: user.id }],
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      participantUser: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, isAiMessage: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Create conversation ──────────────────────────────────────────────────────
export async function createConversation(data: {
  title: string;
  type: ChatType;
  agencyId: string;
  subAccountId?: string;
  participantUserId?: string;
}) {
  const user = await getChatUser();
  if (!user) throw new Error("Unauthorized");

  return db.chatConversation.create({
    data: {
      title: data.title,
      type: data.type,
      agencyId: data.agencyId,
      subAccountId: data.subAccountId,
      userId: user.id,
      participantUserId: data.participantUserId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      participantUser: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
}

// ─── Delete conversation ──────────────────────────────────────────────────────
export async function deleteConversation(conversationId: string) {
  const user = await getChatUser();
  if (!user) throw new Error("Unauthorized");

  // Use deleteMany so it silently no-ops if the record is already gone (avoids P2025)
  return db.chatConversation.deleteMany({
    where: { id: conversationId },
  });
}

// ─── Get messages ─────────────────────────────────────────────────────────────
export async function getMessages(conversationId: string) {
  return db.chatMessage.findMany({
    where: { conversationId },
    include: {
      senderUser: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Send message ─────────────────────────────────────────────────────────────
export async function sendMessage(data: {
  content: string;
  conversationId: string;
  isAiMessage?: boolean;
}) {
  const user = await getChatUser();
  if (!user) throw new Error("Unauthorized");

  const message = await db.chatMessage.create({
    data: {
      content: data.content,
      conversationId: data.conversationId,
      senderUserId: user.id,
      isAiMessage: data.isAiMessage ?? false,
    },
    include: {
      senderUser: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Update conversation
  await db.chatConversation.update({
    where: { id: data.conversationId },
    data: { lastMessage: data.content, updatedAt: new Date() },
  });

  return message;
}

// ─── Get agency users for chat ────────────────────────────────────────────────
export async function getAgencyUsersForChat(agencyId: string) {
  return db.user.findMany({
    where: { agencyId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });
}

// ─── AI Settings ──────────────────────────────────────────────────────────────
export async function getAISettings(agencyId: string) {
  return db.aISettings.findUnique({
    where: { agencyId },
    select: {
      id: true,
      aiProvider: true,
      model: true,
      temperature: true,
      maxTokens: true,
      enabled: true,
      systemPrompt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function upsertAISettings(data: {
  agencyId: string;
  apiKey: string;
  aiProvider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enabled?: boolean;
}) {
  const user = await getChatUser();
  if (!user) throw new Error("Unauthorized");

  return db.aISettings.upsert({
    where: { agencyId: data.agencyId },
    update: {
      apiKey: data.apiKey,
      aiProvider: data.aiProvider ?? "openai",
      model: data.model ?? "gpt-4o",
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 2000,
      systemPrompt: data.systemPrompt,
      enabled: data.enabled ?? true,
    },
    create: {
      agencyId: data.agencyId,
      apiKey: data.apiKey,
      aiProvider: data.aiProvider ?? "openai",
      model: data.model ?? "gpt-4o",
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 2000,
      systemPrompt: data.systemPrompt,
      enabled: data.enabled ?? true,
    },
    select: {
      id: true,
      aiProvider: true,
      model: true,
      temperature: true,
      maxTokens: true,
      enabled: true,
      systemPrompt: true,
    },
  });
}
