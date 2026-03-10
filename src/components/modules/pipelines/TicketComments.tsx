"use client";

import React from "react";
import { format } from "date-fns";
import { Trash2, SendHorizonal, MessageSquare, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { addTicketComment, deleteTicketComment, getTicketComments, getCurrentUserInfo } from "@/queries/ticket-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Comment = Awaited<ReturnType<typeof getTicketComments>>[0];

interface TicketCommentsProps {
    ticketId: string;
}

const TicketComments: React.FC<TicketCommentsProps> = ({ ticketId }) => {
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newComment, setNewComment] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
    const bottomRef = React.useRef<HTMLDivElement>(null);
    const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);

    // Load user info and comments on mount
    React.useEffect(() => {
        Promise.all([
            getTicketComments(ticketId),
            getCurrentUserInfo()
        ])
            .then(([fetchedComments, userInfo]) => {
                setComments(fetchedComments);
                if (userInfo) setCurrentUserRole(userInfo.role);
            })
            .finally(() => setLoading(false));
    }, [ticketId]);

    const canComment = currentUserRole === "AGENCY_OWNER" || currentUserRole === "AGENCY_ADMIN";

    // Auto-scroll to latest comment
    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const comment = await addTicketComment(ticketId, newComment);
            setComments((prev) => [...prev, comment]);
            setNewComment("");
            toast.success("Comment posted");
        } catch (err: any) {
            toast.error(err.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        setDeletingId(commentId);
        try {
            await deleteTicketComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success("Comment deleted");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                    Comments
                    {comments.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                            {comments.length}
                        </Badge>
                    )}
                </span>
            </div>
            <Separator />

            {/* Comment list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {loading ? (
                    <p className="text-xs text-muted-foreground py-2">Loading comments…</p>
                ) : comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                        No comments yet.{canComment ? " Be the first to comment!" : ""}
                    </p>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex gap-3 group"
                            >
                                <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                                    <AvatarImage src={comment.author.avatarUrl} />
                                    <AvatarFallback className="bg-primary text-[10px] text-white">
                                        {comment.author.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold truncate">
                                            {comment.author.name}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[9px] py-0 px-1.5 h-4",
                                                comment.author.role === "AGENCY_OWNER"
                                                    ? "border-amber-400 text-amber-500"
                                                    : "border-sky-400 text-sky-500"
                                            )}
                                        >
                                            {comment.author.role === "AGENCY_OWNER" ? "Owner" : "Admin"}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                                            {format(new Date(comment.createdAt), "dd MMM, hh:mm a")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-foreground/90 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </p>
                                </div>
                                {/* Delete button — for owner/admin */}
                                {canComment && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className={cn(
                                            "opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded hover:bg-destructive/10",
                                            deletingId === comment.id && "opacity-100"
                                        )}
                                        title="Delete comment"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Comment input — for AGENCY_OWNER and AGENCY_ADMIN */}
            {canComment ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment visible to all members…"
                        className="min-h-[72px] text-xs resize-none"
                        disabled={submitting}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                            Ctrl+Enter to submit
                        </span>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting || !newComment.trim()}
                            className="h-7 px-3 gap-1.5 text-xs"
                        >
                            <SendHorizonal className="w-3.5 h-3.5" />
                            {submitting ? "Posting…" : "Post Comment"}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="flex items-center gap-2 py-2 px-3 bg-muted/40 rounded-md">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                        Only agency owners and admins can post comments
                    </span>
                </div>
            )}
        </div>
    );
};

export default TicketComments;
