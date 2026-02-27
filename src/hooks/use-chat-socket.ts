"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher-client";

interface ChatMessage {
  id: string;
  content: string;
  senderUserId: string;
  senderUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  isAiMessage: boolean;
  createdAt: string;
}

/**
 * Hook to subscribe to real-time chat messages for a conversation.
 * Uses Pusher for WebSocket-based real-time updates.
 */
export function useChatSocket(
  conversationId: string | null,
  onNewMessage: (message: ChatMessage) => void
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!conversationId) return;

    const channel = pusherClient.subscribe(`chat-${conversationId}`);

    channel.bind("new-message", (data: ChatMessage) => {
      callbackRef.current(data);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`chat-${conversationId}`);
    };
  }, [conversationId]);
}
