"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  ChevronLeft,
  MessageSquare,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
}

type ViewState = "list" | "chat" | "ai-setup";

export function FloatingChatWidget({ agencyId, subAccountId, currentUserId }: Props) {
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>("list");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [hasAIKey, setHasAIKey] = useState<boolean | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isChatPage = pathname.includes("/chat");

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await getConversations(agencyId, subAccountId);
      setConversations(data as unknown as ConversationItem[]);
    } catch { /* silent */ }
  }, [agencyId, subAccountId]);

  useEffect(() => {
    if (isChatPage) return;
    if (isOpen) {
      refreshConversations();
      setUnreadCount(0);
    }
    if (hasAIKey === null) {
      getAISettings(agencyId).then((s) => setHasAIKey(!!s?.enabled && !!s));
    }
  }, [isOpen, refreshConversations, agencyId, hasAIKey, isChatPage]);

  useEffect(() => {
    if (isChatPage) return;
    if (!selectedId) { setMessages([]); return; }
    setIsLoadingMessages(true);
    getMessages(selectedId).then((data) => {
      setMessages(data.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderUserId: m.senderUserId,
        senderUser: m.senderUser,
        isAiMessage: m.isAiMessage,
        createdAt: m.createdAt.toISOString(),
      })) as ChatMessageData[]);
    }).catch(() => toast.error("Failed to load messages"))
      .finally(() => setIsLoadingMessages(false));
  }, [selectedId, isChatPage]);

  useChatSocket(selectedId, (newMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    if (!isOpen) setUnreadCount((n) => n + 1);
    refreshConversations();
  });

  const selectConversation = (id: string) => { setSelectedId(id); setView("chat"); };
  const goBack = () => { setSelectedId(null); setView("list"); };

  const handleNewDirect = async () => {
    try {
      const users = await getAgencyUsersForChat(agencyId);
      setAgencyUsers(users.filter((u) => u.id !== currentUserId));
      setUserPickerOpen(true);
    } catch { toast.error("Failed to load team members"); }
  };

  const handleSelectUser = async (userId: string, userName: string) => {
    try {
      const conv = await createConversation({ title: `Chat with ${userName}`, type: "DIRECT", agencyId, subAccountId, participantUserId: userId });
      await refreshConversations();
      selectConversation(conv.id);
    } catch { toast.error("Failed to create conversation"); }
  };

  const handleNewAI = async () => {
    if (hasAIKey === false) { setView("ai-setup"); return; }
    // Reuse existing AI conversation if one exists
    const existing = conversations.find((c) => c.type === "AI");
    if (existing) { selectConversation(existing.id); return; }
    // Prevent double-creation
    if (isCreating) return;
    setIsCreating(true);
    try {
      const conv = await createConversation({ title: "AI Assistant", type: "AI", agencyId, subAccountId });
      await refreshConversations();
      selectConversation(conv.id);
    } catch { toast.error("Failed to create AI conversation"); }
    finally { setIsCreating(false); }
  };

  const handleAIKeySuccess = async () => {
    setHasAIKey(true);
    // Reuse existing AI conversation if one exists
    const existing = conversations.find((c) => c.type === "AI");
    if (existing) { selectConversation(existing.id); return; }
    // Prevent double-creation
    if (isCreating) return;
    setIsCreating(true);
    try {
      const conv = await createConversation({ title: "AI Assistant", type: "AI", agencyId, subAccountId });
      await refreshConversations();
      selectConversation(conv.id);
    } catch { setView("list"); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) goBack();
    } catch { toast.error("Failed to delete"); }
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
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      const data = await res.json();
      if (isAI) {
        // AI route returns { userMessage, aiMessage }
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
        // Direct message route returns the message
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, { id: data.id, content: data.content, senderUserId: data.senderUserId, senderUser: data.senderUser, isAiMessage: false, createdAt: data.createdAt }];
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setIsSending(false);
      refreshConversations();
    }
  };

  // Hide on dedicated chat pages (after all hooks)
  if (isChatPage) return null;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => { setIsOpen((o) => !o); setUnreadCount(0); }}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">

          {/* ── List View ─────────────────────────────── */}
          {view === "list" && (
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Messages</h3>
                    <p className="text-[10px] text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNewDirect}>
                          <Users className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">New direct chat</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNewAI}>
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Chat with AI</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <ScrollArea className="flex-1">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div className="rounded-xl bg-muted/50 p-4 mb-3 border">
                      <MessageSquare className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                    </div>
                    <p className="text-sm font-semibold">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-5">Start chatting with your team or AI</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleNewDirect}>
                        <Users className="mr-1.5 h-3.5 w-3.5" /> Team Chat
                      </Button>
                      <Button size="sm" onClick={handleNewAI}>
                        <Bot className="mr-1.5 h-3.5 w-3.5" /> AI Chat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-0.5">
                    {conversations.map((conv) => {
                      const lastMsg = conv.messages?.[0];
                      const other = conv.user.id === currentUserId ? conv.participantUser : conv.user;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => selectConversation(conv.id)}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                        >
                          {conv.type === "AI" ? (
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          ) : (
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage src={other?.avatarUrl} />
                              <AvatarFallback className="bg-muted text-xs font-semibold">
                                {(other?.name || "?")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold truncate">
                                {conv.type === "AI" ? "AI Assistant" : other?.name || conv.title}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                {conv.type === "AI" && (
                                  <Badge variant="outline" className="text-[9px] h-4 px-1 text-primary border-primary/30">AI</Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                                </span>
                              </div>
                            </div>
                            {lastMsg && (
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lastMsg.content}</p>
                            )}
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity flex-shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Quick actions */}
              <div className="border-t p-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-1.5 h-8" onClick={handleNewDirect}>
                  <Users className="h-3.5 w-3.5" /> Direct Chat
                </Button>
                <Button size="sm" className="w-full text-xs justify-start gap-1.5 h-8" onClick={handleNewAI}>
                  <Bot className="h-3.5 w-3.5" /> AI Chat
                  {!hasAIKey && hasAIKey !== null && (
                    <span className="ml-auto text-[9px] opacity-70">setup</span>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* ── AI Setup View ─────────────────────────── */}
          {view === "ai-setup" && (
            <>
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setView("list")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">AI Setup</p>
                  <p className="text-[10px] text-muted-foreground">Configure your API key</p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <AIKeySetup agencyId={agencyId} onSuccess={handleAIKeySuccess} compact />
              </ScrollArea>
            </>
          )}

          {/* ── Chat View ─────────────────────────────── */}
          {view === "chat" && (
            <>
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {selectedConversation?.type === "AI" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={
                        (selectedConversation?.user.id === currentUserId
                          ? selectedConversation?.participantUser?.avatarUrl
                          : selectedConversation?.user.avatarUrl) || ""
                      } />
                      <AvatarFallback className="text-xs font-semibold bg-muted">
                        {selectedConversation?.title?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="text-xs font-bold leading-tight">{selectedConversation?.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {selectedConversation?.type === "AI" ? (
                        <><Bot className="h-2.5 w-2.5" /> AI Powered</>
                      ) : (
                        <><span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> Online</>
                      )}
                    </p>
                  </div>
                </div>
                {selectedConversation?.type === "AI" && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setView("ai-setup")}>
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Change API Key</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <ChatMessages
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoadingMessages}
                isTyping={isSending && selectedConversation?.type === "AI"}
              />

              <ChatInput
                conversationType={selectedConversation?.type || "DIRECT"}
                isLoading={isSending}
                onSend={handleSend}
              />
            </>
          )}
        </div>
      )}

      <UserPickerDialog
        open={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        users={agencyUsers}
        onSelectUser={handleSelectUser}
      />
    </>
  );
}
