"use server";

import { db } from "@/lib/db";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const getDefaultAgency = async () => {
  const agency = await db.agency.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return agency;
};

export const createContactMessage = async (input: CreateContactMessageInput) => {
  const agency = await getDefaultAgency();
  if (!agency) {
    throw new Error("No agency configured to receive contact messages.");
  }

  const contactMessage = await db.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject ?? null,
      message: input.message,
      agencyId: agency.id,
    },
  });

  return contactMessage;
};

export const getContactMessagesByAgency = async (agencyId: string) => {
  if (!agencyId) return [];

  const messages = await db.contactMessage.findMany({
    where: { agencyId },
    orderBy: [{ replied: "asc" }, { createdAt: "desc" }],
  });

  return messages;
};

export const markContactMessageReplied = async (params: {
  messageId: string;
  replySubject?: string;
  replyBody?: string;
}) => {
  const { messageId, replySubject, replyBody } = params;

  const updated = await db.contactMessage.update({
    where: { id: messageId },
    data: {
      replied: true,
      replySubject: replySubject ?? null,
      replyBody: replyBody ?? null,
      replySentAt: new Date(),
    },
  });

  return updated;
};

