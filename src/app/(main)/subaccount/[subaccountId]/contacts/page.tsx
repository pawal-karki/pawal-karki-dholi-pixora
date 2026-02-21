import React from "react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

import { getSubAccountWithContacts } from "@/queries/contacts";
import { formatPrice } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CreateContactButton from "./_components/CreateContactButton";

interface ContactsPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const ContactsPage: React.FC<ContactsPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const data = await getSubAccountWithContacts(subaccountId);

  if (!data) redirect("/subaccount/unauthorized");

  const allContacts = data.contacts;

  const formatTotal = (tickets: { value: Decimal | null }[]) => {
    if (!tickets || !tickets.length) return null;
    const total = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket.value) || 0),
      0
    );
    return formatPrice(total);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between md:flex-row flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and view their activity
          </p>
        </div>
        <CreateContactButton subAccountId={subaccountId} />
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {!!allContacts?.length &&
            allContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {contact.name
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {contact.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {formatTotal(contact.tickets) === null ? (
                    <Badge variant="destructive">
                      Inactive
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-700">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {format(contact.createdAt, "MM/dd/yyyy")}
                </TableCell>
                <TableCell>
                  {formatTotal(contact.tickets) ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          {!allContacts?.length && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-10"
              >
                No contacts yet. Click &ldquo;Create
                Contact&rdquo; to add your first one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsPage;
