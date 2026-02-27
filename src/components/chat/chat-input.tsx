"use client";

import { useRef, useState } from "react";
import {
  Bot,
  FileText,
  Loader2,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";

interface AttachedFile {
  url: string;
  name: string;
  type: "image" | "file";
}

interface Props {
  conversationType: "DIRECT" | "AI";
  isLoading: boolean;
  onSend: (content: string, attachments?: AttachedFile[]) => void;
}

export function ChatInput({ conversationType, isLoading, onSend }: Props) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAI = conversationType === "AI";

  const handleSubmit = () => {
    const trimmed = message.trim();
    if ((!trimmed && attachments.length === 0) || isLoading || isUploading) return;

    let content = trimmed;
    if (attachments.length > 0) {
      const attachLines = attachments.map((a) =>
        a.type === "image" ? `![${a.name}](${a.url})` : `[📎 ${a.name}](${a.url})`
      );
      content = [trimmed, ...attachLines].filter(Boolean).join("\n");
    }

    onSend(content, attachments);
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const busy = isLoading || isUploading;

  return (
    <div className="border-t bg-background p-3">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="relative group flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 pr-6 text-[11px] max-w-[160px]"
            >
              {att.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.url} alt={att.name} className="h-5 w-5 rounded object-cover flex-shrink-0" />
              ) : (
                <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{att.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-1.5">
        {/* Upload  */}
        <div className="flex-shrink-0">
          {isUploading ? (
            <div className="flex h-9 w-9 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UploadButton
              endpoint="chatMedia"
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                if (res?.[0]) {
                  const file = res[0];
                  const isImage = file.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                  setAttachments((prev) => [
                    ...prev,
                    { url: file.url, name: file.name || "file", type: isImage ? "image" : "file" },
                  ]);
                }
              }}
              onUploadError={() => setIsUploading(false)}
              appearance={{
                button: "!h-9 !w-9 !min-w-0 !p-0 !rounded-lg !bg-transparent hover:!bg-accent !border !border-input !text-muted-foreground hover:!text-foreground !ring-0 !shadow-none",
                allowedContent: "!hidden",
                container: "!w-9",
              }}
              content={{ button: <Paperclip className="h-4 w-4" /> }}
            />
          )}
        </div>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isAI ? "Ask AI anything..." : "Type a message..."}
          disabled={busy}
          rows={1}
          className="min-h-[36px] max-h-[120px] resize-none py-2 px-3 text-sm rounded-lg flex-1"
        />

        {/* Send */}
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={busy || (!message.trim() && attachments.length === 0)}
          className="h-9 w-9 flex-shrink-0 rounded-lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
