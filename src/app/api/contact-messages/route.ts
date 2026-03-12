import { NextRequest, NextResponse } from "next/server";

import { parseContactMessageBody } from "@/lib/contact-payload";
import { createContactMessage } from "@/queries/contact-messages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parseContactMessageBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const created = await createContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
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

