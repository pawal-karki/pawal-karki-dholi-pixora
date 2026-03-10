import React from "react";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthDetails } from "@/lib/queries";
import { getContactMessagesByAgency } from "@/queries/contact-messages";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import ReplyDialog from "./_components/reply-dialog";

interface ContactMessagesPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const ContactMessagesPage: React.FC<ContactMessagesPageProps> = async ({ params }) => {
  const { agencyId } = await params;

  if (!agencyId) redirect("/agency/unauthorized");

  const user = await getAuthDetails();

  if (!user || !user.agency || user.agency.id !== agencyId) {
    redirect("/agency/unauthorized");
  }

  if (user.role !== "AGENCY_OWNER" && user.role !== "AGENCY_ADMIN") {
    redirect("/agency/unauthorized");
  }

  const messages = await getContactMessagesByAgency(agencyId);

  // Client-side dialog state is handled in a small client wrapper

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between md:flex-row flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">
            View and reply to messages submitted from your public contact form.
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            All messages sent from the &quot;Contact Us&quot; form on your Pixora site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No contact messages yet. Once visitors submit the contact form on your site,
              they&apos;ll appear here.
            </p>
          ) : (
            <ContactMessagesTable initialMessages={messages} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactMessagesPage;

// ─── Client wrapper for table & dialog ──────────────────────────────────────────

interface ContactMessageRow {
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
}

const ContactMessagesTable = (props: { initialMessages: ContactMessageRow[] }) => {
  "use client";
  const [messages, setMessages] = React.useState<ContactMessageRow[]>(props.initialMessages);
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessageRow | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleOpenReply = (message: ContactMessageRow) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleReplied = () => {
    // Refetch latest state for this message via a lightweight API call
    if (!selectedMessage) return;

    fetch(`/api/contact-messages`, {
      method: "GET",
    })
      .then(() => {
        // For now, just optimistically mark as replied in local state.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? {
                  ...m,
                  replied: true,
                  replySubject: selectedMessage.replySubject ?? m.replySubject,
                  replyBody: selectedMessage.replyBody ?? m.replyBody,
                  replySentAt: new Date(),
                }
              : m
          )
        );
      })
      .catch(() => {
        // no-op – the dialog already shows success, and table will be correct after reload
      });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{msg.name}</span>
                  <span className="text-xs text-muted-foreground">{msg.email}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <span className="line-clamp-2 text-sm">
                  {msg.subject || "No subject"}
                </span>
              </TableCell>
              <TableCell className="max-w-[260px]">
                <span className="line-clamp-2 text-sm text-muted-foreground">
                  {msg.message}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {format(msg.createdAt, "PPp")}
              </TableCell>
              <TableCell>
                {msg.replied ? (
                  <Badge variant="default" className="bg-emerald-600">
                    Replied
                  </Badge>
                ) : (
                  <Badge variant="outline">New</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={msg.replied ? "outline" : "default"}
                  onClick={() => handleOpenReply(msg)}
                >
                  {msg.replied ? "View / Reply" : "Reply"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReplyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={selectedMessage}
        onReplied={handleReplied}
      />
    </>
  );
};

