export type ContactMessageInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type ContactParseResult =
  | { ok: true; data: ContactMessageInput }
  | { ok: false; error: string };

/** Pure parser for POST /api/contact-messages bodies. */
export function parseContactMessageBody(body: unknown): ContactParseResult {
  if (body === null || typeof body !== "object") {
    return { ok: false, error: "Name, email, and message are required." };
  }
  const b = body as Record<string, unknown>;
  const name = b.name;
  const email = b.email;
  const message = b.message;
  const subject = b.subject;

  if (
    name == null ||
    email == null ||
    message == null ||
    String(name).trim() === "" ||
    String(email).trim() === "" ||
    String(message).trim() === ""
  ) {
    return { ok: false, error: "Name, email, and message are required." };
  }

  return {
    ok: true,
    data: {
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      ...(subject != null && String(subject).trim() !== ""
        ? { subject: String(subject).trim() }
        : {}),
    },
  };
}
