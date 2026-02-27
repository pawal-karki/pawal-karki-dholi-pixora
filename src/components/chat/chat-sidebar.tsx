"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bot, Hash, MessageSquare, Plus, Search, Trash2, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ConversationItem {
  id: string;
  title: string;
  type: "DIRECT" | "AI";
  updatedAt: string;
  lastMessage?: string | null;
  user: { id: string; name: string; avatarUrl: string };
  participantUser?: { id: string; name: string; avatarUrl: string } | null;
  messages: { content: string; createdAt: string; isAiMessage: boolean }[];
}

interface Props {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewDirect: () => void;
  onNewAI: () => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewDirect,
  onNewAI,
  onDelete,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-[340px] flex-col border-r bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex gap-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={onNewDirect}>
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New direct chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={onNewAI}>
                  <Bot className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New AI chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <MessageSquare className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="mt-1 text-xs">Start a new chat to get going</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filtered.map((conv) => {
              const isAI = conv.type === "AI";
              const other =
                conv.user.id === currentUserId
                  ? conv.participantUser
                  : conv.user;
              const lastMsg =
                conv.messages?.[0]?.content || conv.lastMessage || "";

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent",
                    selectedId === conv.id && "bg-accent"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {isAI ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={other?.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {other?.name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {conv.title}
                      </span>
                      <span className="flex-shrink-0 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updatedAt), {
                          addSuffix: false,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="truncate text-xs text-muted-foreground">
                        {lastMsg || "Start the conversation..."}
                      </p>
                      {isAI && (
                        <Badge
                          variant="secondary"
                          className="h-5 text-[10px] px-1.5 flex-shrink-0"
                        >
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded p-1 hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
