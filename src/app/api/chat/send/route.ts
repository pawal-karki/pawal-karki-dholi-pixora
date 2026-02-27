import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import { getCurrentUserEmail } from "@/queries/auth";

export async function POST(req: NextRequest) {
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content, conversationId } = body;

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Content and conversationId are required" },
        { status: 400 }
      );
    }

    // Save to database
    const message = await db.chatMessage.create({
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

    // Update conversation + trigger Pusher in background (don't block response)
    db.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, updatedAt: new Date() },
    }).catch(() => { });

    pusherServer.trigger(
      `chat-${conversationId}`,
      "new-message",
      {
        id: message.id,
        content: message.content,
        senderUserId: message.senderUserId,
        senderUser: message.senderUser,
        isAiMessage: false,
        createdAt: message.createdAt,
      }
    ).catch(() => { });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[CHAT_SEND]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
