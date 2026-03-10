import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUserEmail } from "@/queries/auth";
import { sendContactReplyEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messageId, subject, replyBody } = body ?? {};

    if (!messageId || !subject || !replyBody) {
      return NextResponse.json(
        { error: "messageId, subject and replyBody are required." },
        { status: 400 }
      );
    }

    const message = await db.contactMessage.findUnique({
      where: { id: String(messageId) },
      include: {
        agency: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    // Send email reply
    const sent = await sendContactReplyEmail({
      to: message.email,
      subject: String(subject).trim(),
      message: String(replyBody).trim(),
      agencyName: message.agency?.name || undefined,
      originalMessage: message.message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send reply email." },
        { status: 500 }
      );
    }

    const updated = await db.contactMessage.update({
      where: { id: message.id },
      data: {
        replied: true,
        replySubject: String(subject).trim(),
        replyBody: String(replyBody).trim(),
        replySentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("[CONTACT_MESSAGES_REPLY]", error);
    return NextResponse.json(
      { error: "Failed to send reply." },
      { status: 500 }
    );
  }
}

