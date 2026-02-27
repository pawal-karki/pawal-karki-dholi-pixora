"use client";

import { useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, Download, FileText, Loader2, MessageSquareDashed } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ChatMessageData {
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

interface Props {
  messages: ChatMessageData[];
  currentUserId: string;
  isLoading: boolean;
  isTyping?: boolean;
}

function MessageContent({ content, isOwn }: { content: string; isOwn: boolean }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          return (
            <div key={i} className="rounded-lg overflow-hidden max-w-[240px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgMatch[2]} alt={imgMatch[1] || "image"} className="w-full h-auto rounded-lg object-cover" />
              <a href={imgMatch[2]} target="_blank" rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100">
                <Download className="h-3 w-3" /> View full size
              </a>
            </div>
          );
        }
        const fileMatch = line.match(/^\[📎 ([^\]]+)\]\(([^)]+)\)$/);
        if (fileMatch) {
          return (
            <a key={i} href={fileMatch[2]} target="_blank" rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 max-w-[200px]",
                isOwn ? "border-primary-foreground/20" : "border-border"
              )}>
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{fileMatch[1]}</span>
              <Download className="h-3 w-3 flex-shrink-0 opacity-60" />
            </a>
          );
        }
        return line ? (
          <span key={i} className="block whitespace-pre-wrap break-words">{line}</span>
        ) : <br key={i} />;
      })}
    </div>
  );
}

export function ChatMessages({ messages, currentUserId, isLoading, isTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground p-8">
        <div className="rounded-2xl bg-muted/50 p-5 mb-4 border">
          <MessageSquareDashed className="h-8 w-8 opacity-40 mx-auto" />
        </div>
        <p className="font-semibold text-sm">No messages yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Send the first message!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 px-5 py-4">
        {messages.map((msg, i) => {
          const isOwn = msg.senderUserId === currentUserId && !msg.isAiMessage;
          const isAi = msg.isAiMessage;
          const prevMsg = messages[i - 1];
          const nextMsg = messages[i + 1];
          const isSameSenderBefore = prevMsg &&
            prevMsg.senderUserId === msg.senderUserId &&
            prevMsg.isAiMessage === msg.isAiMessage;
          const isSameSenderAfter = nextMsg &&
            nextMsg.senderUserId === msg.senderUserId &&
            nextMsg.isAiMessage === msg.isAiMessage;
          const showHeader = !isSameSenderBefore;
          const showTime = !isSameSenderAfter;

          return (
            <div key={msg.id} className={cn(
              "flex gap-3 group",
              isOwn && "flex-row-reverse",
              isSameSenderBefore ? "mt-0.5" : "mt-4"
            )}>
              {/* Avatar */}
              <div className="w-8 flex-shrink-0 flex items-end">
                {showHeader && (
                  isAi ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8 ring-2 ring-background">
                      <AvatarImage src={msg.senderUser.avatarUrl} />
                      <AvatarFallback className={cn(
                        "text-xs font-semibold",
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {msg.senderUser.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )
                )}
              </div>

              {/* Bubble */}
              <div className={cn("flex flex-col max-w-[72%]", isOwn ? "items-end" : "items-start")}>
                {showHeader && (
                  <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
                    <span className="text-[11px] font-semibold text-foreground/70">
                      {isAi ? "AI Assistant" : isOwn ? "You" : msg.senderUser.name}
                    </span>
                    {isAi && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[9px] text-primary border-primary/30">
                        AI
                      </Badge>
                    )}
                  </div>
                )}

                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : isAi
                      ? "bg-primary/5 border border-primary/15 text-foreground rounded-tl-md"
                      : "bg-muted text-foreground rounded-tl-md",
                  isSameSenderBefore && isOwn && "rounded-tr-2xl",
                  isSameSenderBefore && !isOwn && "rounded-tl-2xl"
                )}>
                  <MessageContent content={msg.content} isOwn={isOwn} />
                </div>

                {showTime && (
                  <span className={cn(
                    "mt-1 text-[10px] text-muted-foreground/50 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    isOwn && "text-right"
                  )}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* AI typing indicator */}
        {isTyping && (
          <div className="flex gap-3 mt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-primary/5 border border-primary/15 px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
