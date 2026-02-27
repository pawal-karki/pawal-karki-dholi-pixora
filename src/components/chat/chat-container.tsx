"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  ChevronLeft,
  MessageSquare,
  MoreVertical,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { ChatMessages, type ChatMessageData } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { AIKeySetup } from "./ai-key-setup";
import { UserPickerDialog } from "./user-picker-dialog";
import { useChatSocket } from "@/hooks/use-chat-socket";
import {
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  getAgencyUsersForChat,
  getAISettings,
} from "@/queries/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ConversationItem {
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
  agencyId: string;
  subAccountId?: string;
  currentUserId: string;
  currentUserName: string;
  showAISettings?: boolean;
}

export function ChatContainer({
  agencyId,
  subAccountId,
  currentUserId,
  currentUserName,
  showAISettings,
}: Props) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [hasAIKey, setHasAIKey] = useState<boolean | null>(null);
  const [showAISetup, setShowAISetup] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // ─── Fetch conversations ──────────────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    try {
      const data = await getConversations(agencyId, subAccountId);
      setConversations(data as unknown as ConversationItem[]);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [agencyId, subAccountId]);

  useEffect(() => {
    refreshConversations();
    getAISettings(agencyId).then((s) => setHasAIKey(!!s?.enabled && !!s));
  }, [refreshConversations, agencyId]);

  // ─── Fetch messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    const load = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await getMessages(selectedId);
        setMessages(data.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderUserId: m.senderUserId,
          senderUser: m.senderUser,
          isAiMessage: m.isAiMessage,
          createdAt: m.createdAt.toISOString(),
        })) as ChatMessageData[]);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    };
    load();
  }, [selectedId]);

  // ─── Real-time updates ────────────────────────────────────────────────────
  useChatSocket(selectedId, (newMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    refreshConversations();
  });

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleNewDirect = async () => {
    try {
      const users = await getAgencyUsersForChat(agencyId);
      setAgencyUsers(users.filter((u) => u.id !== currentUserId));
      setUserPickerOpen(true);
    } catch { toast.error("Failed to load team members"); }
  };

  const handleSelectUser = async (userId: string, userName: string) => {
    try {
      const conv = await createConversation({
        title: `Chat with ${userName}`,
        type: "DIRECT",
        agencyId,
        subAccountId,
        participantUserId: userId,
      });
      await refreshConversations();
      setSelectedId(conv.id);
    } catch { toast.error("Failed to create conversation"); }
  };

  const handleNewAI = async () => {
    if (hasAIKey === false) { setShowAISetup(true); return; }
    const existing = conversations.find((c) => c.type === "AI");
    if (existing) { setSelectedId(existing.id); return; }
    if (isCreating) return;
    setIsCreating(true);
    try {
      const conv = await createConversation({ title: "AI Assistant", type: "AI", agencyId, subAccountId });
      await refreshConversations();
      setSelectedId(conv.id);
    } catch { toast.error("Failed to create AI conversation"); }
    finally { setIsCreating(false); }
  };

  const handleAIKeySuccess = async () => {
    setHasAIKey(true);
    setShowAISetup(false);
    const existing = conversations.find((c) => c.type === "AI");
    if (existing) { setSelectedId(existing.id); return; }
    if (isCreating) return;
    setIsCreating(true);
    try {
      const conv = await createConversation({ title: "AI Assistant", type: "AI", agencyId, subAccountId });
      await refreshConversations();
      setSelectedId(conv.id);
    } catch { toast.error("Failed to create AI conversation"); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success("Conversation deleted");
    } catch { toast.error("Failed to delete conversation"); }
  };

  const handleSend = async (content: string) => {
    if (!selectedId || !selectedConversation) return;
    setIsSending(true);
    try {
      const isAI = selectedConversation.type === "AI";
      const res = await fetch(isAI ? "/api/chat/ai" : "/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      if (isAI) {
        const addMsg = (m: any) => ({
          id: m.id, content: m.content, senderUserId: m.senderUserId,
          senderUser: m.senderUser || { id: "ai-assistant", name: "AI Assistant", email: "", avatarUrl: "" },
          isAiMessage: m.isAiMessage, createdAt: m.createdAt,
        });
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const newMsgs = [...prev];
          if (data.userMessage && !ids.has(data.userMessage.id)) newMsgs.push(addMsg(data.userMessage));
          if (data.aiMessage && !ids.has(data.aiMessage.id)) newMsgs.push(addMsg(data.aiMessage));
          return newMsgs;
        });
      } else {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, { id: data.id, content: data.content, senderUserId: data.senderUserId, senderUser: data.senderUser, isAiMessage: false, createdAt: data.createdAt }];
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
      refreshConversations();
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const direct = filtered.filter((c) => c.type === "DIRECT");
  const ai = filtered.filter((c) => c.type === "AI");

  return (
    <div className="flex h-full overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="flex h-full w-[300px] flex-col border-r bg-muted/20 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Messages</h2>
              <p className="text-[10px] text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleNewDirect}>
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New direct chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleNewAI}>
                    <Bot className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New AI chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1 px-2 pb-2">
          {isLoadingConversations ? (
            <div className="flex justify-center pt-8">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-muted-foreground">No conversations yet</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Start a new chat below</p>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {ai.length > 0 && (
                <div>
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">AI Conversations</p>
                  <div className="space-y-0.5">
                    {ai.map((conv) => (
                      <ConvItem key={conv.id} conv={conv} selectedId={selectedId} currentUserId={currentUserId} onSelect={setSelectedId} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
              {direct.length > 0 && (
                <div>
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Direct Messages</p>
                  <div className="space-y-0.5">
                    {direct.map((conv) => (
                      <ConvItem key={conv.id} conv={conv} selectedId={selectedId} currentUserId={currentUserId} onSelect={setSelectedId} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick actions */}
        <div className="border-t p-3 grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-8 text-xs justify-start gap-1.5" onClick={handleNewDirect}>
            <Users className="h-3.5 w-3.5" /> Direct Chat
          </Button>
          <Button className="h-8 text-xs justify-start gap-1.5" onClick={handleNewAI}>
            <Bot className="h-3.5 w-3.5" /> AI Chat
            {!hasAIKey && hasAIKey !== null && (
              <span className="ml-auto text-[9px] opacity-70">setup</span>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Main Area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {showAISetup ? (
          <>
            <div className="flex items-center gap-3 border-b px-5 py-3">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowAISetup(false)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Setup</p>
                <p className="text-xs text-muted-foreground">Configure your AI API key</p>
              </div>
            </div>
            <AIKeySetup agencyId={agencyId} onSuccess={handleAIKeySuccess} />
          </>
        ) : !selectedId ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="max-w-xs space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                <MessageSquare className="h-9 w-9 text-primary/40" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Welcome to Chat</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Message your team in real-time or chat with AI to get instant answers.
                </p>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button variant="outline" size="sm" onClick={handleNewDirect}>
                  <Users className="mr-1.5 h-3.5 w-3.5" /> New Chat
                </Button>
                <Button size="sm" onClick={handleNewAI}>
                  <Bot className="mr-1.5 h-3.5 w-3.5" /> Ask AI
                </Button>
              </div>
              {!hasAIKey && hasAIKey !== null && (
                <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1">
                  AI chat requires an API key — click &quot;Ask AI&quot; to set it up
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-5 py-3 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {selectedConversation?.type === "AI" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={
                        (selectedConversation?.user.id === currentUserId
                          ? selectedConversation?.participantUser?.avatarUrl
                          : selectedConversation?.user.avatarUrl) || ""
                      } />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {selectedConversation?.title?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{selectedConversation?.title}</h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {selectedConversation?.type === "AI" ? (
                      <><Bot className="h-3 w-3 text-primary" /> AI Powered</>
                    ) : (
                      <><span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> Online</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedConversation?.type === "AI" && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowAISetup(true)}>
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Change API Key / Model</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => selectedId && handleDelete(selectedId, e as any)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages
              messages={messages}
              currentUserId={currentUserId}
              isLoading={isLoadingMessages}
              isTyping={isSending && selectedConversation?.type === "AI"}
            />

            {/* Input */}
            <ChatInput
              conversationType={selectedConversation?.type || "DIRECT"}
              isLoading={isSending}
              onSend={handleSend}
            />
          </>
        )}
      </div>

      <UserPickerDialog
        open={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        users={agencyUsers}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}

// ─── Conversation list item ───────────────────────────────────────────────────
function ConvItem({
  conv,
  selectedId,
  currentUserId,
  onSelect,
  onDelete,
}: {
  conv: ConversationItem;
  selectedId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const isAI = conv.type === "AI";
  const other = conv.user.id === currentUserId ? conv.participantUser : conv.user;
  const lastMsg = conv.messages?.[0]?.content || conv.lastMessage || "";
  const isSelected = selectedId === conv.id;

  return (
    <div
      onClick={() => onSelect(conv.id)}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition-all hover:bg-accent",
        isSelected && "bg-accent"
      )}
    >
      <div className="relative flex-shrink-0">
        {isAI ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        ) : (
          <Avatar className="h-9 w-9">
            <AvatarImage src={other?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {other?.name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold truncate">
            {isAI ? "AI Assistant" : other?.name || conv.title}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            {isAI && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 text-primary border-primary/30">AI</Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {lastMsg || "Start the conversation..."}
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => onDelete(conv.id, e)}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 rounded p-1 hover:bg-destructive/10 text-destructive transition-opacity cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
