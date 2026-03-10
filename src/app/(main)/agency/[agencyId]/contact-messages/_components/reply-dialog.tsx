"use client";

import React from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    createdAt: Date;
    replied: boolean;
    replySubject: string | null;
    replyBody: string | null;
    replySentAt: Date | null;
  } | null;
  onReplied?: () => void;
}

export const ReplyDialog: React.FC<ReplyDialogProps> = ({
  open,
  onOpenChange,
  message,
  onReplied,
}) => {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (message) {
      setSubject(message.replySubject || message.subject || `Re: Contact from ${message.name}`);
      setBody(message.replyBody || "");
    } else {
      setSubject("");
      setBody("");
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    if (!trimmedSubject || !trimmedBody) {
      toast.error("Subject and message are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact-messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message.id,
          subject: trimmedSubject,
          replyBody: trimmedBody,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send reply.");
      }

      toast.success("Reply sent", {
        description: `Your reply was sent to ${message.email}.`,
      });

      onOpenChange(false);
      onReplied?.();
    } catch (error: unknown) {
      console.error("CONTACT_REPLY_ERROR", error);
      toast.error("Could not send reply", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to {message.name}</DialogTitle>
          <DialogDescription>
            This email will be sent from your configured SMTP sender in Pixora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{message.email}</span>
              <Badge variant={message.replied ? "default" : "outline"} className="ml-2">
                {message.replied ? "Replied" : "New"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Received {format(message.createdAt, "PPpp")}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reply-subject">
                Subject
              </label>
              <Input
                id="reply-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reply-body">
                Message
              </label>
              <Textarea
                id="reply-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Original message
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {message.message}
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyDialog;

