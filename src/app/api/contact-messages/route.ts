import { NextRequest, NextResponse } from "next/server";

import { createContactMessage } from "@/queries/contact-messages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const created = await createContactMessage({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : undefined,
      message: String(message).trim(),
    });

    return NextResponse.json({ success: true, message: created });
  } catch (error) {
    console.error("[CONTACT_MESSAGES_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to submit contact message." },
      { status: 500 }
    );
  }
}

