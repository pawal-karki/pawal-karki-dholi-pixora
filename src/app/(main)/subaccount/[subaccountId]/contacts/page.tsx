import React from "react";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ContactsPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const ContactsPage: React.FC<ContactsPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get contacts for this subaccount
  const contacts = await db.contact.findMany({
    where: { subAccountId: subaccountId },
    include: {
      tickets: {
        select: {
          value: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatTotal = (tickets: { value: number | null }[]) => {
    const total = tickets.reduce((acc, ticket) => acc + (ticket.value || 0), 0);
    return Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(total);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and view their activity
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>
      <Separator />

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No contacts yet</p>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add your first contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
            <CardDescription>
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{contact.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={contact.tickets.length > 0 ? "default" : "secondary"}
                      >
                        {contact.tickets.length > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTotal(contact.tickets)}</TableCell>
                    <TableCell>
                      {format(new Date(contact.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactsPage;

